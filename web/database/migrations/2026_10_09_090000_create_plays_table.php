<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One logged play: a score on a chart, with the lamp that goes with it.
 *
 * `user_id` is nullable by the owner's decision. Celestl has no accounts until Fase 4, and until
 * then a signed-out player's history lives in their own browser (also the owner's call) rather than
 * here -- see CLAUDE.md § Kalkulator. Nullable means those rows can be adopted by an account later
 * with an UPDATE instead of a schema change.
 *
 * The play rating is deliberately NOT stored. It is a pure function of the chart constant, the
 * score and the lamp, and chart constants get corrected as the community wiki revises them; a
 * stored rating would quietly go stale against the engine. Recomputing is cheap.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plays', function (Blueprint $table) {
            $table->id();

            // No foreign key yet: `users` is the starter kit's table and Fase 4 will reshape it
            // (see CLAUDE.md § multi-game identity). Pointing a constraint at it now would freeze
            // a decision that has not been made.
            $table->unsignedBigInteger('user_id')->nullable()->index();

            $table->foreignId('chart_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('score');
            $table->string('lamp');
            $table->string('source');
            $table->timestamp('played_at');
            $table->timestamps();

            // Top 50 (Task 2.3) asks for the best play per chart, per player.
            $table->index(['user_id', 'chart_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plays');
    }
};
