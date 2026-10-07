<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\Pack;
use App\Models\Song;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Song>
 */
class SongFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'game_id' => Game::factory(),
            'pack_id' => Pack::factory(),
            'slug' => fake()->unique()->slug(2),
            'title' => fake()->sentence(3),
            'artist' => fake()->name(),
            'side' => fake()->randomElement(['Light', 'Conflict', null]),
            'bpm' => (string) fake()->numberBetween(100, 220),
            'released_at' => fake()->date(),
        ];
    }
}
