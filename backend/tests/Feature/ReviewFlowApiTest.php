<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Branch;
use App\Models\Organization;
use App\Models\QrCode;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewFlowApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed Plans
        $this->seed(\Database\Seeders\PlanSeeder::class);
    }

    public function test_admin_can_onboard_business_successfully(): void
    {
        // 1. Create a Super Admin user and authenticate
        $admin = User::factory()->create();
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $admin->assignRole($role);

        $payload = [
            'name' => 'Brew & Bliss',
            'slug' => 'brew-bliss',
            'logo' => 'https://example.com/logo.png',
            'website' => 'https://brewbliss.in',
            'phone' => '+919876543210',
            'email' => 'contact@brewbliss.in',
            'description' => 'Fine artisanal coffee roasters.',
            'google_review_url' => 'https://g.page/r/brewbliss/review',
            'address_line_1' => '100, Palace Road',
            'city' => 'Udaipur',
            'state' => 'Rajasthan',
            'country' => 'India',
            'postal_code' => '313001',
            'owner_name' => 'Rahul Sharma',
            'owner_email' => 'rahul@brewbliss.in',
            'owner_password' => 'password123',
            'plan_slug' => 'growth',
        ];

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/businesses', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'organization_id',
                    'organization' => [
                        'id',
                        'name',
                        'slug',
                    ],
                    'branches' => [
                        [
                            'id',
                            'name',
                            'city',
                        ]
                    ]
                ]
            ]);

        $this->assertDatabaseHas('businesses', ['slug' => 'brew-bliss']);
        $this->assertDatabaseHas('users', ['email' => 'rahul@brewbliss.in']);
        $this->assertDatabaseHas('organizations', ['name' => 'Brew & Bliss Organization']);
        $this->assertDatabaseHas('branches', ['name' => 'Main Branch', 'city' => 'Udaipur']);
        $this->assertDatabaseHas('subscriptions', ['status' => 'active']);
    }

    public function test_business_owner_can_create_qr_code(): void
    {
        // 1. Setup business
        $organization = Organization::create([
            'name' => 'Test Org',
            'slug' => 'test-org',
        ]);
        $owner = User::factory()->create();
        $organization->users()->attach($owner->id, ['role' => 'owner', 'status' => 'active']);

        $business = Business::create([
            'organization_id' => $organization->id,
            'name' => 'Brew & Bliss',
            'slug' => 'brew-bliss',
            'status' => 'active',
        ]);

        $branch = Branch::create([
            'business_id' => $business->id,
            'name' => 'Main Branch',
            'status' => 'active',
        ]);

        $payload = [
            'business_id' => $business->id,
            'branch_id' => $branch->id,
            'name' => 'Table 01',
            'destination_type' => 'review',
        ];

        $response = $this->actingAs($owner)->postJson('/api/v1/business/qr-codes', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'name',
                    'token_hash',
                    'destination_type',
                ]
            ]);

        $this->assertDatabaseHas('qr_codes', ['name' => 'Table 01']);
    }

    public function test_public_user_can_access_review_flow_and_submit_feedback_with_ai(): void
    {
        // 1. Setup DB structure
        $organization = Organization::create([
            'name' => 'Test Org',
            'slug' => 'test-org',
        ]);
        $business = Business::create([
            'organization_id' => $organization->id,
            'name' => 'Brew & Bliss',
            'slug' => 'brew-bliss',
            'status' => 'active',
        ]);
        $qrCode = QrCode::create([
            'business_id' => $business->id,
            'name' => 'Table 01',
            'token_hash' => 'secure-qr-hash-token-123',
            'destination_type' => 'review',
            'status' => 'active',
        ]);

        // 2. GET public review context
        $response = $this->getJson('/api/v1/public/review/secure-qr-hash-token-123');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'session_token',
                'business' => [
                    'name',
                    'slug',
                    'logo',
                ]
            ]);

        $sessionToken = $response->json('session_token');

        // Check if QR scan was recorded
        $this->assertDatabaseHas('qr_scans', ['qr_code_id' => $qrCode->id]);
        $this->assertDatabaseHas('usage_records', ['metric' => 'qr_scan', 'quantity' => 1]);

        // 3. POST feedback
        $feedbackPayload = [
            'rating' => 5,
            'comment' => 'The filter coffee was outstanding. Highly recommend!',
            'language' => 'en',
        ];

        $feedbackResponse = $this->postJson("/api/v1/public/review/{$sessionToken}/feedback", $feedbackPayload);

        $feedbackResponse->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'feedback' => [
                    'id',
                    'rating',
                    'comment',
                ]
            ]);

        $this->assertDatabaseHas('feedbacks', ['rating' => 5, 'comment' => 'The filter coffee was outstanding. Highly recommend!']);
        $this->assertDatabaseHas('review_sessions', ['session_token' => $sessionToken, 'status' => 'completed']);
        $this->assertDatabaseHas('usage_records', ['metric' => 'feedback_submitted', 'quantity' => 1]);

        // 4. POST AI generate draft with payload overrides
        $generateResponse = $this->postJson("/api/v1/public/review/{$sessionToken}/generate", [
            'rating' => 4,
            'comment' => 'The coffee was decent, but could be served hotter.',
        ]);

        $generateResponse->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'draft' => [
                    'id',
                    'generated_text',
                    'model',
                ]
            ]);

        // Assert feedback was updated to reflect payload overrides
        $this->assertDatabaseHas('feedbacks', [
            'rating' => 4,
            'comment' => 'The coffee was decent, but could be served hotter.',
        ]);
        $this->assertDatabaseHas('review_drafts', ['status' => 'generated']);
        $this->assertDatabaseHas('review_events', ['event_type' => 'draft_generated']);
        $this->assertDatabaseHas('usage_records', ['metric' => 'ai_generation', 'quantity' => 1]);
    }

    public function test_user_can_login_successfully_and_get_roles(): void
    {
        $organization = Organization::create([
            'name' => 'Brew & Bliss Corp',
            'slug' => 'brew-bliss-corp',
        ]);
        $owner = User::create([
            'name' => 'Rahul Sharma',
            'email' => 'rahul@brewbliss.in',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);
        $organization->users()->attach($owner->id, ['role' => 'owner', 'status' => 'active']);

        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $owner->assignRole($role);

        $payload = [
            'email' => 'rahul@brewbliss.in',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/v1/auth/login', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'roles',
                    'organization_id',
                    'organization_slug',
                ]
            ]);

        $this->assertEquals('brew-bliss-corp', $response->json('user.organization_slug'));
        $this->assertContains('owner', $response->json('user.roles'));
    }

    public function test_user_cannot_login_with_incorrect_password(): void
    {
        $user = User::create([
            'name' => 'Rahul Sharma',
            'email' => 'rahul@brewbliss.in',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);

        $payload = [
            'email' => 'rahul@brewbliss.in',
            'password' => 'wrongpassword',
        ];

        $response = $this->postJson('/api/v1/auth/login', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_access_me_and_logout(): void
    {
        $user = User::create([
            'name' => 'Rahul Sharma',
            'email' => 'rahul@brewbliss.in',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        // Test GET /auth/me
        $meResponse = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $meResponse->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'roles',
                ]
            ]);

        // Test POST /auth/logout
        $logoutResponse = $this->postJson('/api/v1/auth/logout', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $logoutResponse->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out successfully.'
            ]);

        // Assert token is revoked/deleted
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    public function test_authenticated_user_can_access_dashboard_stats_and_analytics(): void
    {
        $organization = Organization::create([
            'name' => 'Brew & Bliss Corp',
            'slug' => 'brew-bliss-corp',
        ]);
        $owner = User::create([
            'name' => 'Rahul Sharma',
            'email' => 'rahul@brewbliss.in',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);
        $organization->users()->attach($owner->id, ['role' => 'owner', 'status' => 'active']);

        $business = Business::create([
            'organization_id' => $organization->id,
            'name' => 'Brew & Bliss',
            'slug' => 'brew-bliss',
            'status' => 'active',
        ]);

        $plan = Plan::where('slug', 'growth')->first();

        $subscription = Subscription::create([
            'organization_id' => $organization->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        $token = $owner->createToken('test-token')->plainTextToken;

        // Test stats
        $response = $this->getJson('/api/v1/dashboard/stats', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200)
            ->assertJsonStructure(['total_reviews', 'average_rating', 'total_feedback', 'conversion_rate']);

        // Test chart
        $response = $this->getJson('/api/v1/dashboard/chart', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200)
            ->assertJsonCount(6);

        // Test funnel
        $response = $this->getJson('/api/v1/dashboard/funnel', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200)
            ->assertJsonCount(5);

        // Test sentiment
        $response = $this->getJson('/api/v1/dashboard/sentiment', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200)
            ->assertJsonStructure(['positive', 'neutral', 'negative']);

        // Test topics
        $response = $this->getJson('/api/v1/dashboard/topics', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200);

        // Test recent-feedback
        $response = $this->getJson('/api/v1/dashboard/recent-feedback', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200);

        // Test qr-codes list
        $response = $this->getJson('/api/v1/qr-codes', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200);

        // Test team members
        $response = $this->getJson('/api/v1/team', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200);

        // Test business info
        $response = $this->getJson('/api/v1/business', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200)
            ->assertJsonFragment(['slug' => 'brew-bliss']);

        // Test subscription
        $response = $this->getJson('/api/v1/subscription', [
            'Authorization' => "Bearer {$token}",
        ]);
        $response->assertStatus(200)
            ->assertJsonPath('plan.slug', 'growth');
    }
}
