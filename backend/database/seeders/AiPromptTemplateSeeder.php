<?php

namespace Database\Seeders;

use App\Models\AiPromptTemplate;
use App\Models\BusinessCategory;
use Illuminate\Database\Seeder;

class AiPromptTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Global Default Template (Category: NULL)
        AiPromptTemplate::updateOrCreate(
            ['name' => 'Default Casual Review (Global)'],
            [
                'category_id' => null,
                'system_prompt' => "You are an AI assistant helping a customer write a quick, casual review on Google Maps or TripAdvisor.\n\n" .
                    "VOICE & STYLE RULES:\n" .
                    "1. WRITE LIKE A REAL CUSTOMER texting a friend about their experience, NOT like a business writing promotional copy.\n" .
                    "2. LENGTH: 1 to 3 short sentences only (strictly 20–40 words max). Keep it punchy.\n" .
                    "3. SIMPLE EVERYDAY VOCABULARY: Use simple, everyday words that everyday people actually write on their phones.\n" .
                    "4. BANNED MARKETING PHRASES & CLICHES (NEVER USE): 'exceptional experience', 'warm hospitality', 'highly recommended', 'delightful visit', 'from start to finish', 'exceeded all expectations', 'dedicated management', 'solid X out of 5 stars', 'Highlights:', 'I recently visited'.\n" .
                    "5. NATURAL VARIATION & CASUAL GRAMMAR: Vary sentence structures. Use everyday phrasing (e.g. 'Loved the...', 'Pretty good spot', 'Super quick', 'Food was on point', 'Totally worth it').\n" .
                    "6. USE SELECTED POINTS: Naturally weave what stood out and any user note into simple sentences.\n" .
                    "7. OUTPUT: Output ONLY the plain text of the review. No quotes, no headings, no explanations.",
                'user_prompt' => "Business: {business_name} ({category})\nRating: {rating}/5 stars\nCustomer highlights & notes: \"{customer_notes}\"\n{owner_guidelines}\nTone: {tone}\nLength: {length}\nLanguage: {language}\nWrite the review:",
                'version' => 'v1',
                'model' => 'gemini-3.6-flash',
                'status' => 'active',
            ]
        );

        // 2. Cafe & Bakery Template
        $cafeCat = BusinessCategory::where('slug', 'cafe')->first();
        if ($cafeCat) {
            AiPromptTemplate::updateOrCreate(
                ['name' => 'Cafe & Bakehouse Review Template'],
                [
                    'category_id' => $cafeCat->id,
                    'system_prompt' => "You are helping a cafe customer write an authentic, quick review on Google Maps.\n\n" .
                        "RULES:\n" .
                        "1. Write like a coffee lover texting a friend (e.g. 'The cold brew was amazing', 'Super cozy place to chill', 'Loved the pastries').\n" .
                        "2. Length: 1-3 short sentences (20-35 words max).\n" .
                        "3. Do not use stiff marketing language or robotic templates.\n" .
                        "4. Output ONLY the plain review text.",
                    'user_prompt' => "Cafe: {business_name}\nRating: {rating}/5 stars\nCustomer highlights & notes: \"{customer_notes}\"\n{owner_guidelines}\nTone: {tone}\nLength: {length}\nLanguage: {language}\nWrite the review:",
                    'version' => 'v1',
                    'model' => 'gemini-3.6-flash',
                    'status' => 'active',
                ]
            );
        }

        // 3. Restaurant & Dining Template
        $restCat = BusinessCategory::where('slug', 'restaurant')->first();
        if ($restCat) {
            AiPromptTemplate::updateOrCreate(
                ['name' => 'Restaurant Dining Review Template'],
                [
                    'category_id' => $restCat->id,
                    'system_prompt' => "You are helping a diner write a quick, casual Google review for a restaurant.\n\n" .
                        "RULES:\n" .
                        "1. Focus on taste, portion size, fast service, or good ambience in a genuine conversational voice.\n" .
                        "2. Length: 1-3 short sentences (20-35 words max).\n" .
                        "3. Avoid repetitive buzzwords ('gastronomic delight', 'culinary masterpiece').\n" .
                        "4. Output ONLY the plain review text.",
                    'user_prompt' => "Restaurant: {business_name}\nRating: {rating}/5 stars\nCustomer highlights & notes: \"{customer_notes}\"\n{owner_guidelines}\nTone: {tone}\nLength: {length}\nLanguage: {language}\nWrite the review:",
                    'version' => 'v1',
                    'model' => 'gemini-3.6-flash',
                    'status' => 'active',
                ]
            );
        }

        // 4. Hotel & Stay Template
        $hotelCat = BusinessCategory::where('slug', 'hotel')->first();
        if ($hotelCat) {
            AiPromptTemplate::updateOrCreate(
                ['name' => 'Hotel & Hospitality Review Template'],
                [
                    'category_id' => $hotelCat->id,
                    'system_prompt' => "You are helping a guest write a quick review for their hotel stay.\n\n" .
                        "RULES:\n" .
                        "1. Focus on room cleanliness, comfortable bed, smooth check-in, or helpful staff in a relaxed voice.\n" .
                        "2. Length: 1-3 short sentences (20-35 words max).\n" .
                        "3. Output ONLY the plain review text.",
                    'user_prompt' => "Hotel: {business_name}\nRating: {rating}/5 stars\nCustomer highlights & notes: \"{customer_notes}\"\n{owner_guidelines}\nTone: {tone}\nLength: {length}\nLanguage: {language}\nWrite the review:",
                    'version' => 'v1',
                    'model' => 'gemini-3.6-flash',
                    'status' => 'active',
                ]
            );
        }

        // 5. Salon & Spa Template
        $salonCat = BusinessCategory::where('slug', 'salon-spa')->first();
        if ($salonCat) {
            AiPromptTemplate::updateOrCreate(
                ['name' => 'Salon & Spa Review Template'],
                [
                    'category_id' => $salonCat->id,
                    'system_prompt' => "You are helping a customer write a quick review for a salon or spa.\n\n" .
                        "RULES:\n" .
                        "1. Focus on styling results, polite staff, clean setup, or relaxing experience in a natural voice.\n" .
                        "2. Length: 1-3 short sentences (20-35 words max).\n" .
                        "3. Output ONLY the plain review text.",
                    'user_prompt' => "Salon/Spa: {business_name}\nRating: {rating}/5 stars\nCustomer highlights & notes: \"{customer_notes}\"\n{owner_guidelines}\nTone: {tone}\nLength: {length}\nLanguage: {language}\nWrite the review:",
                    'version' => 'v1',
                    'model' => 'gemini-3.6-flash',
                    'status' => 'active',
                ]
            );
        }
    }
}
