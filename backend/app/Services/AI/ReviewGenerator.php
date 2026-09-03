<?php

namespace App\Services\AI;

use App\Ai\Agents\ReviewGeneratorAgent;
use App\Models\Feedback;
use App\Models\ReviewDraft;
use App\Models\ReviewEvent;
use App\Models\UsageRecord;
use Illuminate\Support\Facades\Log;

class ReviewGenerator
{
    public function generate(Feedback $feedback): ReviewDraft
    {
        $rating = (int)$feedback->rating;
        $rawComment = trim($feedback->comment ?? '');
        $business = $feedback->business;

        $businessName = $business ? $business->name : 'this place';
        $category = $business && $business->category ? $business->category->name : 'place';

        // Load custom business settings configured by owner
        $language = $feedback->language ?: ($business ? $business->getSetting('default_language', 'en') : 'en');
        $tone = $business ? $business->getSetting('ai_tone', 'casual') : 'casual';
        $length = $business ? $business->getSetting('review_length', 'medium') : 'medium';
        $customGuidelines = $business ? $business->getSetting('custom_ai_instructions', '') : '';

        $toneInstruction = match ($tone) {
            'enthusiastic' => 'Enthusiastic and energetic customer voice (thrilled, loves the vibe).',
            'friendly' => 'Warm, friendly, and appreciative customer voice.',
            'concise' => 'Short, straight to the point (no extra fluff).',
            'professional' => 'Polite, well-spoken, and respectful tone.',
            default => 'Casual, everyday voice like texting a friend about a visit.',
        };

        $lengthInstruction = match ($length) {
            'short' => 'STRICTLY 1 to 2 short sentences (approx 15 to 25 words max).',
            'detailed' => '3 to 4 natural sentences (approx 45 to 60 words max).',
            default => 'STRICTLY 2 to 3 short sentences (approx 25 to 40 words max).',
        };

        $langInstruction = match ($language) {
            'hi' => 'Write in natural Hindi (Devanagari script).',
            'hinglish' => 'Write in Hinglish (Hindi words written using English/Latin alphabet, e.g. "Khana bohot tasty tha aur staff bhi polite tha").',
            'es' => 'Write in natural Spanish.',
            'fr' => 'Write in natural French.',
            'de' => 'Write in natural German.',
            default => 'Write in natural English.',
        };

        $guidelineSnippet = !empty($customGuidelines) ? "Owner's Special Guidelines: \"{$customGuidelines}\"\n" : "";

        // Query active prompt template managed by admin (category-specific or global default)
        $template = null;
        if ($business && $business->category_id) {
            $template = \App\Models\AiPromptTemplate::where('category_id', $business->category_id)
                ->where('status', 'active')
                ->latest('id')
                ->first();
        }
        if (!$template) {
            $template = \App\Models\AiPromptTemplate::whereNull('category_id')
                ->where('status', 'active')
                ->latest('id')
                ->first();
        }

        if ($template && !empty($template->user_prompt)) {
            $promptText = strtr($template->user_prompt, [
                '{business_name}' => $businessName,
                '{category}' => $category,
                '{rating}' => (string)$rating,
                '{customer_notes}' => $rawComment,
                '{owner_guidelines}' => $guidelineSnippet,
                '{tone}' => $toneInstruction,
                '{length}' => $lengthInstruction,
                '{language}' => $langInstruction,
            ]);
        } else {
            $promptText = "Business: {$businessName} ({$category})\n" .
                "Rating: {$rating}/5 stars\n" .
                "Customer highlights & notes: \"{$rawComment}\"\n" .
                $guidelineSnippet .
                "Tone: {$toneInstruction}\n" .
                "Length: {$lengthInstruction}\n" .
                "Language: {$langInstruction}\n" .
                "Write the review:";
        }

        $promptVersion = $template ? $template->version : 'v1';

        $generatedText = '';
        $inputTokens = 0;
        $outputTokens = 0;
        $modelName = 'unknown';

        try {
            $agent = new ReviewGeneratorAgent();
            $response = $agent->prompt($promptText);

            $generatedText = trim($response->text);
            $generatedText = trim($generatedText, "\"'\n\r ");
            $inputTokens = $response->usage->promptTokens ?? 0;
            $outputTokens = $response->usage->completionTokens ?? 0;
            $modelName = $response->meta->model ?? 'default';
        } catch (\Exception $e) {
            Log::warning("AI generation failed or offline, falling back to human review generator: " . $e->getMessage());

            $generatedText = $this->generateHumanFallback($businessName, $rating, $rawComment, $tone, $length, $language);
            $inputTokens = strlen($promptText);
            $outputTokens = strlen($generatedText);
            $modelName = 'mock-generator';
        }

        // Create the ReviewDraft
        $draft = ReviewDraft::create([
            'feedback_id' => $feedback->id,
            'version' => 1,
            'generated_text' => $generatedText,
            'model' => $modelName,
            'prompt_version' => 'v4',
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
            'status' => 'generated',
        ]);

        // Record a review event
        ReviewEvent::create([
            'feedback_id' => $feedback->id,
            'review_draft_id' => $draft->id,
            'event_type' => 'draft_generated',
            'metadata' => [
                'rating' => $rating,
                'tone' => $tone,
                'length' => $length,
                'language' => $language,
                'comment_length' => strlen($rawComment),
            ],
            'created_at' => now(),
        ]);

        // Increment the usage record for AI generations
        if ($business) {
            UsageRecord::create([
                'organization_id' => $business->organization_id,
                'business_id' => $business->id,
                'metric' => 'ai_generation',
                'quantity' => 1,
                'period_start' => now()->startOfMonth(),
                'period_end' => now()->endOfMonth(),
            ]);
        }

        return $draft;
    }

    /**
     * Generates a casual, natural review matching owner settings if offline.
     */
    private function generateHumanFallback(
        string $bizName,
        int $rating,
        string $rawComment,
        string $tone = 'casual',
        string $length = 'medium',
        string $language = 'en'
    ): string {
        $highlights = [];
        $extraNote = '';

        if (preg_match('/Highlights:\s*([^.]+)\.?(.*)/is', $rawComment, $matches)) {
            $tagString = trim($matches[1]);
            $highlights = array_filter(array_map('trim', explode(',', $tagString)));
            $extraNote = trim($matches[2]);
        } elseif (!empty($rawComment)) {
            $extraNote = $rawComment;
        }

        // Clean extra note
        $cleanNote = preg_replace('/^(Note|Comment|Feedback):\s*/i', '', $extraNote);
        $cleanNote = trim($cleanNote, " .\t\n\r");

        // Format highlight mention casually
        $highlightPhrase = '';
        if (!empty($highlights)) {
            $count = count($highlights);
            if ($count === 1) {
                $highlightPhrase = strtolower($highlights[0]);
            } elseif ($count === 2) {
                $highlightPhrase = strtolower($highlights[0]) . ' and ' . strtolower($highlights[1]);
            } else {
                $last = array_pop($highlights);
                $highlightPhrase = strtolower(implode(', ', $highlights)) . ' and ' . strtolower($last);
            }
        }

        if ($language === 'hi' || $language === 'hinglish') {
            if ($rating >= 4) {
                $hTag = $highlightPhrase ? "{$highlightPhrase} bohot badhiya tha" : "experience bohot accha tha";
                return "{$bizName} mein {$hTag}. " . ($cleanNote ? "{$cleanNote}. " : "") . "Staff kaafi polite aur service fast thi. Definitely visit karenge dobara!";
            } else {
                return "{$bizName} mein visit theek thaak raha. Service thodi aur fast ho sakti thi.";
            }
        }

        $seed = crc32($bizName . $rawComment . $rating) % 4;

        if ($rating >= 5) {
            if ($highlightPhrase && $cleanNote) {
                $options = [
                    "Loved the {$highlightPhrase} at {$bizName}! {$cleanNote}. Definitely coming back.",
                    "Really great spot! The {$highlightPhrase} was on point, and {$cleanNote}.",
                    "Super happy with {$bizName}. {$cleanNote} The {$highlightPhrase} made it totally worth it.",
                    "Such a good experience here. {$cleanNote}. The {$highlightPhrase} was awesome!"
                ];
                return $options[abs($seed)];
            } elseif ($highlightPhrase) {
                $options = [
                    "Had a great time at {$bizName}! The {$highlightPhrase} was really good and staff was super friendly. Will be back!",
                    "Loved the {$highlightPhrase} here. Everything was smooth and the whole vibe was great.",
                    "Honestly a top spot. The {$highlightPhrase} was spot on and service was quick!",
                    "Really impressed with {$bizName}. The {$highlightPhrase} was awesome. Definitely worth checking out!"
                ];
                return $options[abs($seed)];
            } elseif ($cleanNote) {
                return "Great visit to {$bizName}! {$cleanNote}. Everything was super smooth, will definitely be back.";
            } else {
                return "Great experience at {$bizName}! Friendly people, super fast service, and good vibes all around.";
            }
        } elseif ($rating === 4) {
            if ($highlightPhrase && $cleanNote) {
                return "Pretty good visit to {$bizName}. Loved the {$highlightPhrase}. {$cleanNote}. Will visit again!";
            } elseif ($highlightPhrase) {
                return "Pretty good visit to {$bizName}! The {$highlightPhrase} was solid and people were friendly.";
            } elseif ($cleanNote) {
                return "Good experience at {$bizName}. {$cleanNote}. Pretty satisfied overall with the visit.";
            } else {
                return "Good visit to {$bizName}. Quick service, polite staff, and good quality overall.";
            }
        } elseif ($rating === 3) {
            return "Decent visit to {$bizName}. Was alright overall, but could be a bit quicker.";
        } else {
            return "Didn't have a great experience today at {$bizName}. Service and wait times need improvement.";
        }
    }
}
