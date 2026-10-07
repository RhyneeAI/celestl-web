<?php

namespace Database\Factories;

use App\Difficulty;
use App\Models\Chart;
use App\Models\Song;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chart>
 */
class ChartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'song_id' => Song::factory(),
            'difficulty' => fake()->randomElement(Difficulty::cases())->value,
            'level' => (string) fake()->numberBetween(1, 12),
            'constant' => fake()->randomFloat(1, 1, 12),
            'note_count' => fake()->numberBetween(300, 1500),
        ];
    }
}
