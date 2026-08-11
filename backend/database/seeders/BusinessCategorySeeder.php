<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use Illuminate\Database\Seeder;

class BusinessCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Cafe', 'slug' => 'cafe', 'icon' => 'Coffee', 'status' => 'active'],
            ['name' => 'Restaurant', 'slug' => 'restaurant', 'icon' => 'UtensilsCrossed', 'status' => 'active'],
            ['name' => 'Hotel', 'slug' => 'hotel', 'icon' => 'Hotel', 'status' => 'active'],
            ['name' => 'Salon & Spa', 'slug' => 'salon_spa', 'icon' => 'Scissors', 'status' => 'active'],
            ['name' => 'Clinic & Healthcare', 'slug' => 'clinic_healthcare', 'icon' => 'Stethoscope', 'status' => 'active'],
            ['name' => 'Retail Store', 'slug' => 'retail_store', 'icon' => 'ShoppingBag', 'status' => 'active'],
            ['name' => 'Furniture Store', 'slug' => 'furniture_store', 'icon' => 'Armchair', 'status' => 'active'],
            ['name' => 'Gym & Fitness', 'slug' => 'gym_fitness', 'icon' => 'Dumbbell', 'status' => 'active'],
            ['name' => 'Auto Service', 'slug' => 'auto_service', 'icon' => 'Car', 'status' => 'active'],
            ['name' => 'Jewellery Store', 'slug' => 'jewellery_store', 'icon' => 'Gem', 'status' => 'active'],
            ['name' => 'Fashion & Boutique', 'slug' => 'fashion_boutique', 'icon' => 'Shirt', 'status' => 'active'],
            ['name' => 'Beauty & Cosmetics', 'slug' => 'beauty_cosmetics', 'icon' => 'Sparkles', 'status' => 'active'],
            ['name' => 'Education & Coaching', 'slug' => 'education_coaching', 'icon' => 'GraduationCap', 'status' => 'active'],
            ['name' => 'Home Services', 'slug' => 'home_services', 'icon' => 'Home', 'status' => 'active'],
            ['name' => 'Professional Services', 'slug' => 'professional_services', 'icon' => 'Briefcase', 'status' => 'active'],
        ];

        foreach ($categories as $category) {
            BusinessCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
