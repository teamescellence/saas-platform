<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\QrCode;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:30',
            'business_name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign owner role
        $role = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $user->assignRole($role);

        // Generate clean unique organization slug
        $bizName = !empty($validated['business_name']) ? $validated['business_name'] : $validated['name'] . "'s Org";
        $orgSlugBase = Str::slug($bizName) ?: 'org';
        $orgSlug = $orgSlugBase;
        $counter = 1;
        while (Organization::where('slug', $orgSlug)->exists()) {
            $orgSlug = $orgSlugBase . '-' . (++$counter);
        }

        $organization = Organization::create([
            'name' => $bizName,
            'slug' => $orgSlug,
            'status' => 'active',
        ]);

        $organization->users()->attach($user->id, [
            'role' => 'owner',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        // Generate clean unique business slug
        $bizSlugBase = Str::slug($bizName) ?: 'business';
        $bizSlug = $bizSlugBase;
        $bizCounter = 1;
        while (Business::where('slug', $bizSlug)->exists()) {
            $bizSlug = $bizSlugBase . '-' . (++$bizCounter);
        }

        $business = Business::create([
            'organization_id' => $organization->id,
            'name' => $bizName,
            'slug' => $bizSlug,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'],
            'status' => 'active',
        ]);

        $branch = Branch::create([
            'business_id' => $business->id,
            'name' => 'Main Location',
            'phone' => $validated['phone'] ?? null,
            'status' => 'active',
        ]);

        $qrCode = QrCode::create([
            'business_id' => $business->id,
            'branch_id' => $branch->id,
            'name' => 'Main QR Code',
            'token_hash' => Str::random(24),
            'destination_type' => 'review',
            'status' => 'active',
        ]);

        // Default Starter plan subscription
        $starterPlan = Plan::where('slug', 'starter')->first() ?? Plan::first();
        if ($starterPlan) {
            Subscription::create([
                'organization_id' => $organization->id,
                'plan_id' => $starterPlan->id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => now()->addYear(),
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'organization_id' => $organization->id,
                'organization_slug' => $organization->slug,
            ],
            'business' => [
                'id' => $business->id,
                'name' => $business->name,
                'slug' => $business->slug,
                'qr_token' => $qrCode->token_hash,
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke existing tokens if any to keep database clean
        $user->tokens()->delete();

        // Generate Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Load organization structure
        $organization = $user->organizations()->first();

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(), // Spatie permission roles
                'organization_id' => $organization ? $organization->id : null,
                'organization_slug' => $organization ? $organization->slug : null,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $organization = $user->organizations()->first();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'organization_id' => $organization ? $organization->id : null,
                'organization_slug' => $organization ? $organization->slug : null,
            ]
        ]);
    }
}
