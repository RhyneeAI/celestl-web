<?php

namespace Database\Factories;

use App\Difficulty;
use App\Models\UnofficialChart;
use App\Models\UnofficialSong;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UnofficialChart>
 */
class UnofficialChartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'unofficial_song_id' => UnofficialSong::factory(),
            'difficulty' => fake()->randomElement(Difficulty::cases())->value,
            'constant' => fake()->randomFloat(1, 1, 12),
        ];
    }
}
