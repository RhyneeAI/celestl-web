<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\Pack;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pack>
 */
class PackFactory extends Factory
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
            'slug' => fake()->unique()->slug(1),
            'name' => fake()->words(2, true),
            'section' => fake()->randomElement(['Arcaea', 'Side Story', 'Collaboration', null]),
            'parent_id' => null,
            'small_pack_image' => false,
        ];
    }
}
