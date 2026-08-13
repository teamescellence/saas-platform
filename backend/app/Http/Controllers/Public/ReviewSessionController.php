<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\SubmitFeedbackRequest;
use App\Models\Feedback;
use App\Models\QrCode;
use App\Models\QrScan;
use App\Models\ReviewSession;
use App\Models\UsageRecord;
use App\Services\AI\ReviewGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReviewSessionController extends Controller
{
    public function show(string $token)
    {
        // 1. Try to find by ReviewSession session_token directly
        $existingSession = ReviewSession::where('session_token', $token)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingSession) {
            $qrCode = $existingSession->qrCode;
            $business = $existingSession->business;

            return response()->json([
                'session_token' => $existingSession->session_token,
                'business' => [
                    'name' => $business->name,
                    'slug' => $business->slug,
                    'logo' => $business->logo,
                    'description' => $business->description,
                    'google_review_url' => $business->google_review_url,
                ],
                'branch' => $qrCode->branch ? [
                    'name' => $qrCode->branch->name,
                ] : null,
            ]);
        }

        // 2. Otherwise, look up by QrCode token_hash
        $qrCode = QrCode::where('token_hash', $token)
            ->where('status', 'active')
            ->firstOrFail();

        $business = $qrCode->business;
        $sessionKey = 'review_session_' . $qrCode->id;

        // Check if there is an active session stored in the Laravel session
        if (session()->has($sessionKey)) {
            $sessionFromSession = ReviewSession::where('id', session($sessionKey))
                ->where('expires_at', '>', now())
                ->first();

            if ($sessionFromSession) {
                return response()->json([
                    'session_token' => $sessionFromSession->session_token,
                    'business' => [
                        'name' => $business->name,
                        'slug' => $business->slug,
                        'logo' => $business->logo,
                        'description' => $business->description,
                        'google_review_url' => $business->google_review_url,
                    ],
                    'branch' => $qrCode->branch ? [
                        'name' => $qrCode->branch->name,
                    ] : null,
                ]);
            }
        }

        // 1. Increment QrCode scans
        $qrCode->increment('scan_count');
        $qrCode->update(['last_scanned_at' => now()]);

        // 2. Parse User-Agent
        $userAgent = request()->header('User-Agent', '');
        $deviceType = 'desktop';
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $userAgent)) {
            $deviceType = 'tablet';
        } elseif (preg_match('/(mobi|ipod|phone|blackberry|opera mini|fennec)/i', $userAgent)) {
            $deviceType = 'mobile';
        }

        $browser = 'unknown';
        if (preg_match('/MSIE/i', $userAgent) && !preg_match('/Opera/i', $userAgent)) {
            $browser = 'Internet Explorer';
        } elseif (preg_match('/Firefox/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/Safari/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Opera/i', $userAgent)) {
            $browser = 'Opera';
        }

        // 3. Log QrScan
        QrScan::create([
            'qr_code_id' => $qrCode->id,
            'business_id' => $qrCode->business_id,
            'branch_id' => $qrCode->branch_id,
            'session_id' => session()->getId(),
            'device_type' => $deviceType,
            'browser' => $browser,
            'country' => 'India', // Defaulting for regional focus
            'city' => $business->city ?? null,
            'scanned_at' => now(),
        ]);

        // 4. Increment QrScan Metric in Usage records
        UsageRecord::create([
            'organization_id' => $business->organization_id,
            'business_id' => $business->id,
            'metric' => 'qr_scan',
            'quantity' => 1,
            'period_start' => now()->startOfMonth(),
            'period_end' => now()->endOfMonth(),
        ]);

        // 5. Create active ReviewSession
        $sessionToken = Str::random(40);
        $session = ReviewSession::create([
            'qr_code_id' => $qrCode->id,
            'business_id' => $qrCode->business_id,
            'branch_id' => $qrCode->branch_id,
            'session_token' => $sessionToken,
            'status' => 'started',
            'started_at' => now(),
            'expires_at' => now()->addHours(2),
        ]);

        // Store session ID in user's Laravel session
        session([$sessionKey => $session->id]);

        return response()->json([
            'session_token' => $sessionToken,
            'business' => [
                'name' => $business->name,
                'slug' => $business->slug,
                'logo' => $business->logo,
                'description' => $business->description,
                'google_review_url' => $business->google_review_url,
            ],
            'branch' => $qrCode->branch ? [
                'name' => $qrCode->branch->name,
            ] : null,
        ]);
    }

    public function submitFeedback(SubmitFeedbackRequest $request, string $token)
    {
        $session = ReviewSession::where('session_token', $token)
            ->whereIn('status', ['started', 'completed'])
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $validated = $request->validated();

        $feedback = Feedback::updateOrCreate(
            ['review_session_id' => $session->id],
            [
                'business_id' => $session->business_id,
                'branch_id' => $session->branch_id,
                'qr_code_id' => $session->qr_code_id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
                'language' => $validated['language'] ?? 'en',
                'status' => 'pending',
                'submitted_at' => now(),
            ]
        );

        $session->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Increment feedback submitted metric
        $business = $session->business;
        UsageRecord::create([
            'organization_id' => $business->organization_id,
            'business_id' => $business->id,
            'metric' => 'feedback_submitted',
            'quantity' => 1,
            'period_start' => now()->startOfMonth(),
            'period_end' => now()->endOfMonth(),
        ]);

        return response()->json([
            'message' => 'Feedback submitted successfully.',
            'feedback' => $feedback,
        ], 201);
    }

    public function generateDraft(Request $request, string $token)
    {
        $session = ReviewSession::where('session_token', $token)
            ->where('status', 'completed')
            ->firstOrFail();

        // Get the associated feedback
        $feedback = Feedback::where('review_session_id', $session->id)->firstOrFail();

        // Validate optional overrides in request payload
        $validated = $request->validate([
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:5000'],
        ]);

        if (isset($validated['rating'])) {
            $feedback->rating = $validated['rating'];
        }
        if (array_key_exists('comment', $validated)) {
            $feedback->comment = $validated['comment'];
        }

        if ($feedback->isDirty()) {
            $feedback->save();
        }

        $generator = new ReviewGenerator();
        $draft = $generator->generate($feedback);

        return response()->json([
            'message' => 'AI Review Draft generated successfully.',
            'draft' => $draft,
        ], 201);
    }
}
