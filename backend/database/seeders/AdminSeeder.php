<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Super Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@reviewflow.in'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
            ]
        );

        // Assign super-admin role
        try {
            $role = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
            $admin->assignRole($role);
        } catch (\Exception $e) {
            // Ignore if tables are not fully initialized during custom testing
        }
    }
}
