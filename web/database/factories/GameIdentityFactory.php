<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\GameIdentity;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameIdentity>
 */
class GameIdentityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'game_id' => Game::factory(),
            'identifier_type' => GameIdentity::TYPE_PLAYER_ID,
            'identifier_value' => (string) fake()->unique()->numberBetween(100_000_000, 999_999_999),
            'display_name' => fake()->userName(),
        ];
    }
}
