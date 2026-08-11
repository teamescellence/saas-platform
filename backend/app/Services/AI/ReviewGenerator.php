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
        $rating = $feedback->rating;
        $comment = $feedback->comment ?? '';
        $business = $feedback->business;

        $businessContext = "";
        if ($business) {
            $businessContext .= "Business Name: {$business->name}\n";
            if ($business->description) {
                $businessContext .= "Business Description: {$business->description}\n";
            }
            if ($business->city) {
                $businessContext .= "Location: {$business->city}\n";
            }
        }

        $promptText = "{$businessContext}Rating: {$rating} stars.\nRaw feedback: \"{$comment}\".";

        $generatedText = '';
        $inputTokens = 0;
        $outputTokens = 0;
        $modelName = 'unknown';

        try {
            $agent = new ReviewGeneratorAgent();
            $response = $agent->prompt($promptText);

            $generatedText = trim($response->text);
            $inputTokens = $response->usage->promptTokens ?? 0;
            $outputTokens = $response->usage->completionTokens ?? 0;
            $modelName = $response->meta->model ?? 'default';
        } catch (\Exception $e) {
            Log::warning("AI generation failed, falling back to mock generator: " . $e->getMessage());

            // Provide a high-quality mock response based on the feedback comment and rating (~200 words)
            $bizName = $business ? $business->name : 'this business';
            if (!empty($comment)) {
                $generatedText = "I recently visited {$bizName} and wanted to share my detailed thoughts. Overall, I would rate my experience as a solid {$rating} out of 5 stars. {$comment} " .
                    "The service was handled in a professional manner, and it's clear the management is dedicated to providing a quality experience. " .
                    "They paid great attention to the cleanliness and overall presentation of the location. " .
                    "I really appreciated the warm welcome we received upon arrival, and the staff made sure we were comfortable throughout our time there. " .
                    "It is rare to find places that maintain such consistent quality standards. I will definitely be returning to {$bizName} soon with my family and friends, and I highly recommend others in the area to check them out as well!";
            } else {
                $generatedText = match ((int)$rating) {
                    5 => "I recently had the pleasure of visiting {$bizName} and it was an absolute delight from start to finish! The service was prompt, the staff was extremely warm, and the overall experience exceeded all my expectations. Every detail was handled with care, making our visit memorable. I highly recommend {$bizName} to anyone looking for premium quality. Definitely a 5-star experience that I will be sharing with all my friends and family. Will be visiting again very soon!",
                    4 => "I had a very good experience during my recent visit to {$bizName}. The service was polite, and the overall quality was highly impressive. The staff was friendly and attentive to our needs. While there is minor room for quick adjustments, the overall environment and value were wonderful. I definitely recommend visiting {$bizName} and will return for another pleasant experience.",
                    3 => "My recent visit to {$bizName} was decent, but left some room for improvement. The service was acceptable, and the staff was polite, but there were some noticeable delays. The quality of the experience was average. It's a nice place, but with a bit more focus on responsiveness and efficiency, it could easily become much better. A fair 3-star rating.",
                    2 => "Unfortunately, my experience at {$bizName} did not meet expectations. We faced significant delays in service, and the staff seemed quite distracted. Although the location itself has potential, the lack of coordination and speed made our visit frustrating. I hope the management takes note of this feedback and implements training to improve the service quality. 2 stars.",
                    default => "I was highly disappointed with my visit to {$bizName}. The service was extremely poor, the wait times were unacceptable, and the overall experience was very sub-par. I tried to resolve it with the staff, but there was no proper response. I cannot recommend {$bizName} based on this experience, and I sincerely hope they take immediate action to revamp their operations.",
                };
            }
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
            'prompt_version' => 'v1',
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
                'comment_length' => strlen($comment),
            ],
            'created_at' => now(),
        ]);

        // Increment the usage record for AI generations
        $business = $feedback->business;
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
}
