<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * An account carries no attributes of its own -- see App\Models\User.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [];
    }
}
