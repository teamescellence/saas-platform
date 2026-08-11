<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::updateOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'description' => 'Perfect for a single-location small business starting out.',
                'price' => 0.00,
                'currency' => 'INR',
                'billing_interval' => 'monthly',
                'max_branches' => 1,
                'max_qr_codes' => 5,
                'max_feedbacks' => 500,
                'max_ai_generations' => 500,
                'features' => ['1 Branch Limit', '5 Active QR Codes', '500 Feedbacks / month', '500 AI Review Generations', 'Basic Analytics'],
                'status' => 'active',
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'growth'],
            [
                'name' => 'Growth',
                'description' => 'Best for growing businesses with multiple locations.',
                'price' => 1999.00,
                'currency' => 'INR',
                'billing_interval' => 'monthly',
                'max_branches' => 5,
                'max_qr_codes' => 25,
                'max_feedbacks' => 2500,
                'max_ai_generations' => 2500,
                'features' => ['5 Branch Limit', '25 Active QR Codes', '2500 Feedbacks / month', '2500 AI Review Generations', 'Advanced Analytics', 'Email Support'],
                'status' => 'active',
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'pro'],
            [
                'name' => 'Pro',
                'description' => 'Comprehensive feature set for large scale enterprises.',
                'price' => 4999.00,
                'currency' => 'INR',
                'billing_interval' => 'monthly',
                'max_branches' => 20,
                'max_qr_codes' => 100,
                'max_feedbacks' => 10000,
                'max_ai_generations' => 10000,
                'features' => ['20 Branch Limit', '100 Active QR Codes', '10000 Feedbacks / month', '10000 AI Review Generations', 'Custom Branding', 'Priority Support', 'API Access'],
                'status' => 'active',
            ]
        );
    }
}
