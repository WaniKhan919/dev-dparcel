<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Ensure the 'admin' role exists (created by RoleSeeder)
            $adminRole = Role::firstOrCreate(
                ['name' => 'admin'],
                ['status' => 'active']
            );

            // Create or update the admin user
            $user = User::updateOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name'  => 'Super Admin',
                    'password' => Hash::make('admin123'),
                    'phone' => '03001234567',
                    'status' => 'active',

                    // mark verified
                    'verification_code' => null,
                    'verification_code_expires_at' => null,
                    'email_verified_at' => now(),
                    'is_verified' => true,

                    // reset fields cleared
                    'reset_password_token' => null,
                    'reset_password_expires_at' => null,

                    'remember_token' => Str::random(60),
                ]
            );

            // Attach the admin role (via relation)
            $user->roles()->syncWithoutDetaching([$adminRole->id]);

            // If you *don’t* have relations, you could do this instead:
            // DB::table('user_roles')->updateOrInsert(
            //     ['user_id' => $user->id, 'role_id' => $adminRole->id],
            //     ['created_at' => now(), 'updated_at' => now()]
            // );
        });
    }
}
