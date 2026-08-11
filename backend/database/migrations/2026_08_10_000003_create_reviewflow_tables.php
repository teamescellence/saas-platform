<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name'); // e.g. Table 01, Billing Counter
            $table->string('token_hash')->unique();
            $table->string('destination_type')->default('review');
            $table->unsignedBigInteger('scan_count')->default(0);
            $table->timestamp('last_scanned_at')->nullable();
            $table->enum('status', ['active', 'disabled'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('qr_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qr_code_id')->constrained()->onDelete('cascade');
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable();
            $table->string('device_type')->nullable();
            $table->string('browser')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->timestamp('scanned_at')->useCurrent();
        });

        Schema::create('review_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qr_code_id')->constrained()->onDelete('cascade');
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_token')->unique();
            $table->enum('status', ['started', 'rating_selected', 'completed', 'expired'])->default('started');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
        });

        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_session_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('qr_code_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating'); // 1 to 5
            $table->text('comment')->nullable();
            $table->string('language', 10)->default('en');
            $table->enum('status', ['pending', 'analyzed', 'processed'])->default('pending');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('feedback_analysis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_id')->constrained('feedbacks')->onDelete('cascade');
            $table->enum('sentiment', ['positive', 'neutral', 'negative'])->default('neutral');
            $table->decimal('sentiment_score', 4, 3)->default(0.000);
            $table->json('topics')->nullable(); // e.g. ["coffee", "service"]
            $table->string('language', 10)->default('en');
            $table->text('summary')->nullable();
            $table->timestamps();
        });

        Schema::create('review_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_id')->constrained('feedbacks')->onDelete('cascade');
            $table->unsignedSmallInteger('version')->default(1);
            $table->text('generated_text');
            $table->string('model')->default('gpt-4o');
            $table->string('prompt_version')->default('v1');
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->enum('status', ['generated', 'approved', 'rejected'])->default('generated');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('review_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_id')->constrained('feedbacks')->onDelete('cascade');
            $table->foreignId('review_draft_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_type'); // draft_generated, draft_edited, google_clicked, completed
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_events');
        Schema::dropIfExists('review_drafts');
        Schema::dropIfExists('feedback_analysis');
        Schema::dropIfExists('feedbacks');
        Schema::dropIfExists('review_sessions');
        Schema::dropIfExists('qr_scans');
        Schema::dropIfExists('qr_codes');
    }
};
