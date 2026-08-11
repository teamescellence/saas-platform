<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReviewDraft extends Model
{
    protected $fillable = [
        'feedback_id',
        'version',
        'generated_text',
        'model',
        'prompt_version',
        'input_tokens',
        'output_tokens',
        'status',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function feedback(): BelongsTo
    {
        return $this->belongsTo(Feedback::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(ReviewEvent::class);
    }
}
