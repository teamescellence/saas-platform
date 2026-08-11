<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Branch;
use App\Models\Organization;
use App\Models\QrCode;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Feedback;
use App\Models\ReviewSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class BusinessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Organization
        $organization = Organization::updateOrCreate(
            ['slug' => 'brew-bliss-org'],
            ['name' => 'Brew & Bliss Corporation']
        );

        // 2. Create Owner User
        $owner = User::updateOrCreate(
            ['email' => 'rahul@brewbliss.in'],
            [
                'name' => 'Rahul Sharma',
                'password' => Hash::make('password123'),
            ]
        );

        // Assign business-owner role
        $role = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $owner->assignRole($role);

        // Attach owner to organization
        if (!$organization->users()->where('user_id', $owner->id)->exists()) {
            $organization->users()->attach($owner->id, [
                'role' => 'owner',
                'status' => 'active',
                'joined_at' => now(),
            ]);
        }

        // 3. Create Business
        $cafeCategory = \App\Models\BusinessCategory::where('slug', 'cafe')->first();
        $business = Business::updateOrCreate(
            ['slug' => 'brew-bliss'],
            [
                'organization_id' => $organization->id,
                'category_id' => $cafeCategory?->id,
                'name' => 'Brew & Bliss',
                'logo' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80',
                'website' => 'https://brewbliss.in',
                'phone' => '+919876543210',
                'email' => 'contact@brewbliss.in',
                'description' => 'Fine artisanal coffee roasters and bakehouse.',
                'google_review_url' => 'https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs',
                'status' => 'active',
            ]
        );

        // 4. Create Branch
        $branch = Branch::updateOrCreate(
            ['business_id' => $business->id, 'name' => 'Main Branch'],
            [
                'address_line_1' => '100, Palace Road',
                'city' => 'Udaipur',
                'state' => 'Rajasthan',
                'country' => 'India',
                'postal_code' => '313001',
                'status' => 'active',
            ]
        );

        // 5. Create Subscription
        $plan = Plan::where('slug', 'growth')->first();
        if ($plan) {
            Subscription::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'plan_id' => $plan->id,
                ],
                [
                    'status' => 'active',
                    'trial_ends_at' => null,
                    'starts_at' => now(),
                    'ends_at' => now()->addYear(),
                ]
            );
        }

        // 6. Create QR Codes
        $qrTokens = [
            'Table 01' => 'secure-qr-hash-token-123',
            'Table 02' => 'secure-qr-hash-token-456',
            'Table 03' => 'secure-qr-hash-token-789',
        ];

        foreach ($qrTokens as $name => $token) {
            QrCode::updateOrCreate(
                [
                    'business_id' => $business->id,
                    'branch_id' => $branch->id,
                    'name' => $name,
                ],
                [
                    'token_hash' => $token,
                    'destination_type' => 'review',
                    'status' => 'active',
                ]
            );
        }

        // 7. Seed some dummy feedbacks
        $comments = [
            5 => [
                'The filter coffee and croissants were absolutely outstanding. Warm and helpful staff!',
                'Best cold brew in Udaipur! Loved the calm and rustic ambience. Highly recommended.',
            ],
            4 => [
                'Really good artisanal pour-over. Service was quick, though the seating area was a bit crowded.',
                'Loved the paneer tikka sandwich and chocolate muffin. Very polite team.',
            ],
            3 => [
                'Decent coffee, but the service was quite slow during peak morning hours.',
            ]
        ];

        foreach ($comments as $rating => $texts) {
            foreach ($texts as $comment) {
                // Create a completed session
                $session = ReviewSession::create([
                    'qr_code_id' => QrCode::first()->id,
                    'business_id' => $business->id,
                    'branch_id' => $branch->id,
                    'session_token' => 'session-token-' . uniqid(),
                    'status' => 'completed',
                    'started_at' => now()->subDays(rand(1, 10)),
                    'completed_at' => now(),
                ]);

                Feedback::create([
                    'review_session_id' => $session->id,
                    'business_id' => $business->id,
                    'branch_id' => $branch->id,
                    'qr_code_id' => $session->qr_code_id,
                    'rating' => $rating,
                    'comment' => $comment,
                    'language' => 'en',
                    'submitted_at' => now(),
                ]);
            }
        }
    }
}
