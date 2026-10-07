<?php

namespace Database\Factories;

use App\Models\UnofficialSong;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UnofficialSong>
 */
class UnofficialSongFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'title' => fake()->sentence(3),
            'artist' => fake()->name(),
        ];
    }
}
