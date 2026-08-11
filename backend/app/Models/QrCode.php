<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class QrCode extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'business_id',
        'branch_id',
        'name',
        'token_hash',
        'destination_type',
        'scan_count',
        'last_scanned_at',
        'status',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function scans(): HasMany
    {
        return $this->hasMany(QrScan::class);
    }

    public function reviewSessions(): HasMany
    {
        return $this->hasMany(ReviewSession::class);
    }
}
