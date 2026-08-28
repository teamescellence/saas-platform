<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\Plan;
use App\Models\QrCode;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OnboardingController extends Controller
{
    /**
     * Get available public metadata for onboarding (categories & plans).
     */
    public function metadata()
    {
        $categories = BusinessCategory::where('status', 'active')->get();
        $plans = Plan::where('status', 'active')->get();

        return response()->json([
            'categories' => $categories,
            'plans' => $plans,
        ]);
    }

    /**
     * Process onboarding submission for the authenticated user's business.
     */
    public function setup(Request $request)
    {
        $user = $request->user();
        $organization = $user->organizations()->first();

        if (!$organization) {
            return response()->json(['message' => 'No organization associated with this account.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_slug' => 'nullable|string',
            'website' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address_line_1' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:3000',
            'google_review_url' => 'nullable|string|max:1000',
            'plan_slug' => 'nullable|string|max:50',
        ]);

        // Find or create Business
        $business = $organization->businesses()->first();
        if (!$business) {
            $slugBase = Str::slug($validated['name']) ?: 'biz';
            $slug = $slugBase;
            $counter = 1;
            while (Business::where('slug', $slug)->exists()) {
                $slug = $slugBase . '-' . (++$counter);
            }

            $business = Business::create([
                'organization_id' => $organization->id,
                'name' => $validated['name'],
                'slug' => $slug,
                'status' => 'active',
            ]);
        }

        // Category lookup
        $categoryId = null;
        if (!empty($validated['category_slug'])) {
            $cat = BusinessCategory::where('slug', $validated['category_slug'])->first();
            $categoryId = $cat?->id;
        }

        // Update business details
        $business->update([
            'name' => $validated['name'],
            'category_id' => $categoryId ?? $business->category_id,
            'website' => $validated['website'] ?? $business->website,
            'phone' => $validated['phone'] ?? $business->phone,
            'address_line_1' => $validated['address_line_1'] ?? $business->address_line_1,
            'city' => $validated['city'] ?? $business->city,
            'state' => $validated['state'] ?? $business->state,
            'country' => $validated['country'] ?? ($business->country ?: 'India'),
            'postal_code' => $validated['postal_code'] ?? $business->postal_code,
            'description' => $validated['description'] ?? $business->description,
            'google_review_url' => $validated['google_review_url'] ?? $business->google_review_url,
        ]);

        // Update or create main Branch
        $branch = $business->branches()->first();
        if (!$branch) {
            $branch = Branch::create([
                'business_id' => $business->id,
                'name' => 'Main Location',
                'phone' => $business->phone,
                'address_line_1' => $business->address_line_1,
                'city' => $business->city,
                'state' => $business->state,
                'country' => $business->country ?: 'India',
                'postal_code' => $business->postal_code,
                'status' => 'active',
            ]);
        } else {
            $branch->update([
                'phone' => $business->phone,
                'address_line_1' => $business->address_line_1,
                'city' => $business->city,
                'state' => $business->state,
                'country' => $business->country ?: 'India',
                'postal_code' => $business->postal_code,
            ]);
        }

        // Ensure QR Code exists
        $qrCode = $business->qrCodes()->first();
        if (!$qrCode) {
            $qrCode = QrCode::create([
                'business_id' => $business->id,
                'branch_id' => $branch->id,
                'name' => 'Main QR Code',
                'token_hash' => Str::random(24),
                'destination_type' => 'review',
                'status' => 'active',
            ]);
        }

        // Plan & Subscription
        $planSlug = $validated['plan_slug'] ?? 'growth';
        $plan = Plan::where('slug', $planSlug)->first() ?? Plan::where('slug', 'growth')->first() ?? Plan::first();
        if ($plan) {
            Subscription::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                ],
                [
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'trial_ends_at' => null,
                    'starts_at' => now(),
                    'ends_at' => now()->addYear(),
                ]
            );
        }

        return response()->json([
            'message' => 'Onboarding completed successfully!',
            'business' => [
                'id' => $business->id,
                'name' => $business->name,
                'slug' => $business->slug,
                'subdomain' => $business->slug . '.reviewflow.in',
                'website' => $business->website,
                'phone' => $business->phone,
                'address' => $business->address_line_1,
                'city' => $business->city,
                'state' => $business->state,
                'google_review_url' => $business->google_review_url,
                'description' => $business->description,
            ],
            'branch' => [
                'id' => $branch->id,
                'name' => $branch->name,
            ],
            'qr_code' => [
                'id' => $qrCode->id,
                'name' => $qrCode->name,
                'token' => $qrCode->token_hash,
                'url' => url('/q/' . $qrCode->token_hash),
            ],
            'plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
            ] : null,
        ]);
    }
}
