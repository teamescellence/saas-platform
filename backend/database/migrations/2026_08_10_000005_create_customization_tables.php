<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            $table->string('key');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'key']);
        });

        Schema::create('review_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('business_categories')->nullOnDelete();
            $table->string('question');
            $table->string('type')->default('rating'); // rating, text, choice
            $table->boolean('is_required')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('ai_prompt_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('business_categories')->nullOnDelete();
            $table->string('name');
            $table->text('system_prompt');
            $table->text('user_prompt');
            $table->string('version')->default('v1');
            $table->string('model')->default('gpt-4o');
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_prompt_templates');
        Schema::dropIfExists('review_questions');
        Schema::dropIfExists('business_settings');
    }
};
