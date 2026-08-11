<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackAnalysis extends Model
{
    protected $table = 'feedback_analysis';

    protected $fillable = [
        'feedback_id',
        'sentiment',
        'sentiment_score',
        'topics',
        'language',
        'summary',
    ];

    protected $casts = [
        'topics' => 'array',
        'sentiment_score' => 'decimal:3',
    ];

    public function feedback(): BelongsTo
    {
        return $this->belongsTo(Feedback::class);
    }
}
