<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateBusinessRequest;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    public function store(CreateBusinessRequest $request)
    {
        $validated = $request->validated();

        $business = DB::transaction(function () use ($validated) {
            // 1. Create Organization
            $orgSlug = Str::slug($validated['name'] . '-' . Str::random(4));
            $organization = Organization::create([
                'name' => $validated['name'] . ' Organization',
                'slug' => $orgSlug,
                'status' => 'active',
            ]);

            // 2. Create User (Owner)
            $user = User::create([
                'name' => $validated['owner_name'],
                'email' => $validated['owner_email'],
                'password' => Hash::make($validated['owner_password']),
            ]);

            // 3. Attach User to Organization
            $organization->users()->attach($user->id, [
                'role' => 'owner',
                'status' => 'active',
                'joined_at' => now(),
            ]);

            // 4. Retrieve Plan
            $plan = Plan::where('slug', $validated['plan_slug'])->firstOrFail();

            // 5. Create Subscription
            Subscription::create([
                'organization_id' => $organization->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => now()->addMonth(),
                'provider' => 'internal',
            ]);

            // 6. Create Business
            $business = Business::create([
                'organization_id' => $organization->id,
                'category_id' => $validated['category_id'] ?? null,
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'logo' => $validated['logo'] ?? null,
                'website' => $validated['website'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'description' => $validated['description'] ?? null,
                'google_review_url' => $validated['google_review_url'] ?? null,
                'address_line_1' => $validated['address_line_1'] ?? null,
                'address_line_2' => $validated['address_line_2'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'country' => $validated['country'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'status' => 'active',
            ]);

            // 7. Create Default Branch (Main Branch)
            Branch::create([
                'business_id' => $business->id,
                'name' => 'Main Branch',
                'phone' => $validated['phone'] ?? null,
                'address_line_1' => $validated['address_line_1'] ?? null,
                'address_line_2' => $validated['address_line_2'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'country' => $validated['country'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'status' => 'active',
            ]);

            return $business;
        });

        return response()->json([
            'message' => 'Business onboarded successfully.',
            'data' => $business->load(['organization', 'branches']),
        ], 201);
    }
}
