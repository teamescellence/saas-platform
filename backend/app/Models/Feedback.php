<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Feedback extends Model
{
    protected $table = 'feedbacks';

    protected $fillable = [
        'review_session_id',
        'business_id',
        'branch_id',
        'qr_code_id',
        'rating',
        'comment',
        'language',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function reviewSession(): BelongsTo
    {
        return $this->belongsTo(ReviewSession::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function qrCode(): BelongsTo
    {
        return $this->belongsTo(QrCode::class);
    }

    public function analysis(): HasOne
    {
        return $this->hasOne(FeedbackAnalysis::class);
    }

    public function reviewDrafts(): HasMany
    {
        return $this->hasMany(ReviewDraft::class);
    }

    public function latestDraft()
    {
        return $this->hasOne(ReviewDraft::class)->latestOfMany();
    }
}
