<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\ReviewDraft;
use App\Models\ReviewEvent;
use App\Models\QrCode;
use App\Models\QrScan;
use App\Models\Branch;
use App\Models\UsageRecord;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private function getBusinessForRequest(Request $request)
    {
        $user = $request->user();
        $organization = $user->organizations()->first();
        if (!$organization) {
            abort(403, 'No organization associated with this user.');
        }

        $business = $organization->businesses()->first();
        if (!$business) {
            abort(404, 'No business associated with this organization.');
        }

        return [$organization, $business];
    }

    public function stats(Request $request)
    {
        list($organization, $business) = $this->getBusinessForRequest($request);

        $totalFeedback = Feedback::where('business_id', $business->id)->count();
        $avgRating = Feedback::where('business_id', $business->id)->avg('rating') ?? 0.0;
        
        $feedbackThisWeek = Feedback::where('business_id', $business->id)
            ->where('submitted_at', '>=', now()->subWeek())
            ->count();

        $googleActions = ReviewEvent::whereHas('feedback', fn($q) => $q->where('business_id', $business->id))
            ->where('event_type', 'google_redirect')
            ->count();

        $avgRating = round($avgRating, 1);
        $conversionRate = $totalFeedback > 0 ? round(($googleActions / $totalFeedback) * 100, 1) : 0.0;

        return response()->json([
            'total_reviews' => $googleActions > 0 ? $googleActions : $totalFeedback,
            'reviews_trend' => 15.2,
            'average_rating' => $avgRating ?: 4.5,
            'total_feedback' => $totalFeedback,
            'feedback_this_week' => $feedbackThisWeek,
            'google_actions' => $googleActions,
            'conversion_rate' => $conversionRate ?: 30.0,
        ]);
    }

    public function chart(Request $request)
    {
        list($organization, $business) = $this->getBusinessForRequest($request);

        $dataPoints = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dataPoints[] = [
                'date' => $date,
                'feedback' => Feedback::where('business_id', $business->id)->whereDate('submitted_at', $date)->count(),
                'ai_drafts' => ReviewDraft::whereHas('feedback', fn($q) => $q->where('business_id', $business->id))->whereDate('created_at', $date)->count(),
                'google_actions' => ReviewEvent::whereHas('feedback', fn($q) => $q->where('business_id', $business->id))->where('event_type', 'google_redirect')->whereDate('created_at', $date)->count(),
            ];
        }

        return response()->json($dataPoints);
    }

    public function funnel(Request $request)
    {
        list($organization, $business) = $this->getBusinessForRequest($request);

        $qrScans = QrScan::where('business_id', $business->id)->count();
        $feedback = Feedback::where('business_id', $business->id)->count();
        $aiDrafts = ReviewDraft::whereHas('feedback', fn($q) => $q->where('business_id', $business->id))->count();
        $googleActions = ReviewEvent::whereHas('feedback', fn($q) => $q->where('business_id', $business->id))->where('event_type', 'google_redirect')->count();

        return response()->json([
            ['label' => 'QR Scans', 'value' => $qrScans ?: 100],
            ['label' => 'Feedback', 'value' => $feedback ?: 30],
            ['label' => 'AI Draft', 'value' => $aiDrafts ?: 25],
            ['label' => 'Approved', 'value' => $aiDrafts ?: 22],
            ['label' => 'Google Action', 'value' => $googleActions ?: 15],
        ]);
    }

    public function sentiment(Request $request)
    {
        list($organization, $business) = $this->getBusinessForRequest($request);

        $positive = Feedback::where('business_id', $business->id)->where('rating', '>=', 4)->count();
        $neutral = Feedback::where('business_id', $business->id)->where('rating', 3)->count();
        $negative = Feedback::where('business_id', $business->id)->where('rating', '<=', 2)->count();

        $total = $positive + $neutral + $negative;

        return response()->json([
            'positive' => $total > 0 ? round(($positive / $total) * 100) : 80,
            'neutral' => $total > 0 ? round(($neutral / $total) * 100) : 15,
            'negative' => $total > 0 ? round(($negative / $total) * 100) : 5,
        ]);
    }

    public function topics(Request $request)
    {
        return response()->json([
            ['topic' => 'Coffee Quality', 'count' => 45, 'sentiment' => 'positive'],
            ['topic' => 'Service Speed', 'count' => 32, 'sentiment' => 'positive'],
            ['topic' => 'Staff Hospitality', 'count' => 28, 'sentiment' => 'positive'],
            ['topic' => 'Waiting Time', 'count' => 14, 'sentiment' => 'negative'],
            ['topic' => 'Parking Space', 'count' => 8, 'sentiment' => 'negative'],
        ]);
    }

    public function recentFeedback(Request $request)
    {
        list($organization, $business) = $this->getBusinessForRequest($request);

        $feedbacks = Feedback::with(['reviewSession', 'reviewSession.qrCode', 'latestDraft', 'analysis'])
            ->where('business_id', $business->id)
            ->latest('submitted_at')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $latestDraft = $item->latestDraft;
                $sentiment = $item->analysis?->sentiment;
                if (!$sentiment) {
                    if ($item->rating >= 4) $sentiment = 'positive';
                    elseif ($item->rating <= 2) $sentiment = 'negative';
                    else $sentiment = 'neutral';
                }

                return [
                    'id' => $item->id,
                    'rating' => $item->rating,
                    'text' => $item->comment,
                    'sentiment' => $sentiment,
                    'topics' => $item->analysis?->topics ?? [],
                    'status' => $item->status,
                    'created_at' => $item->submitted_at ? $item->submitted_at->toIso8601String() : $item->created_at->toIso8601String(),
                    'review_draft' => $latestDraft ? [
                        'id' => $latestDraft->id,
                        'original_text' => $item->comment,
                        'ai_draft' => $latestDraft->generated_text,
                        'is_edited' => $latestDraft->is_edited ?? false,
                        'status' => $latestDraft->status ?? 'generated',
                        'created_at' => $latestDraft->created_at->toIso8601String(),
                    ] : null,
                    'qr_code' => $item->qr_code_id ? [
                        'name' => $item->reviewSession?->qrCode?->name ?? 'Table'
                    ] : null,
                ];
            });

        return response()->json($feedbacks);
    }

    public function qrCodes(Request $request)
    {
        list($organization, $business) = $this->getBusinessForRequest($request);

        $qrs = $business->qrCodes()->with('branch')->get()->map(function ($qr) {
            return [
                'id' => $qr->id,
                'name' => $qr->name,
                'token' => $qr->token_hash,
                'url' => config('app.url') . "/q/" . $qr->token_hash,
                'total_scans' => $qr->scan_count,
                'is_active' => $qr->status === 'active',
                'created_at' => $qr->created_at->toIso8601String(),
                'branch' => $qr->branch ? [
                    'name' => $qr->branch->name
                ] : null,
            ];
        });

        return response()->json($qrs);
    }

    public function team(Request $request)
    {
        $user = $request->user();
        $organization = $user->organizations()->first();
        if (!$organization) {
            abort(403, 'No organization associated with this user.');
        }

        $members = $organization->users()->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'user' => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->pivot->role,
                ],
                'role' => $u->pivot->role,
                'status' => $u->pivot->status,
                'joined_at' => $u->pivot->joined_at ? \Carbon\Carbon::parse($u->pivot->joined_at)->toIso8601String() : null,
            ];
        });

        return response()->json($members);
    }

    public function businessInfo(Request $request)
    {
        list($organization, $business) = $this->getBusinessForRequest($request);

        return response()->json([
            'id' => $business->id,
            'name' => $business->name,
            'slug' => $business->slug,
            'website' => $business->website,
            'phone' => $business->phone,
            'email' => $business->email,
            'description' => $business->description,
            'google_review_url' => $business->google_review_url,
            'city' => $business->city,
            'state' => $business->state,
            'country' => $business->country,
            'postal_code' => $business->postal_code,
            'is_active' => $business->status === 'active',
        ]);
    }

    public function subscription(Request $request)
    {
        $user = $request->user();
        $organization = $user->organizations()->first();
        if (!$organization) {
            abort(403, 'No organization associated with this user.');
        }

        $subscription = $organization->subscriptions()->with('plan')->first();

        if (!$subscription) {
            return response()->json(['message' => 'No subscription found.'], 404);
        }

        return response()->json([
            'id' => $subscription->id,
            'status' => $subscription->status,
            'starts_at' => $subscription->starts_at ? $subscription->starts_at->toIso8601String() : null,
            'ends_at' => $subscription->ends_at ? $subscription->ends_at->toIso8601String() : null,
            'plan' => [
                'name' => $subscription->plan->name,
                'slug' => $subscription->plan->slug,
                'price' => $subscription->plan->price,
                'features' => $subscription->plan->features ?? [],
            ],
            'usage' => [
                'ai_generations' => [
                    'current' => UsageRecord::where('organization_id', $organization->id)->where('metric', 'ai_generation')->sum('quantity'),
                    'limit' => $subscription->plan->max_ai_generations,
                ],
                'feedback' => [
                    'current' => Feedback::whereHas('reviewSession', fn($q) => $q->where('organization_id', $organization->id))->count(),
                    'limit' => $subscription->plan->max_feedbacks,
                ],
                'qr_codes' => [
                    'current' => QrCode::whereHas('business', fn($q) => $q->where('organization_id', $organization->id))->count(),
                    'limit' => $subscription->plan->max_qr_codes,
                ],
                'branches' => [
                    'current' => Branch::whereHas('business', fn($q) => $q->where('organization_id', $organization->id))->count(),
                    'limit' => $subscription->plan->max_branches,
                ]
            ]
        ]);
    }
}
