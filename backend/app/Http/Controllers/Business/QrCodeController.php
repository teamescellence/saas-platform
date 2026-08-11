<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\CreateQrCodeRequest;
use App\Models\Business;
use App\Models\QrCode;
use Illuminate\Support\Str;

class QrCodeController extends Controller
{
    public function store(CreateQrCodeRequest $request)
    {
        $validated = $request->validated();

        $business = Business::findOrFail($validated['business_id']);

        // Check if user belongs to the organization of the business
        if (!$request->user()->organizations()->where('organizations.id', $business->organization_id)->exists()) {
            return response()->json([
                'message' => 'You do not have permission to manage QR codes for this business.'
            ], 403);
        }

        // Generate unpredictable cryptographically secure token hash
        $token = Str::random(40);

        $qrCode = QrCode::create([
            'business_id' => $business->id,
            'branch_id' => $validated['branch_id'] ?? null,
            'name' => $validated['name'],
            'token_hash' => $token,
            'destination_type' => $validated['destination_type'] ?? 'review',
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'QR Code generated successfully.',
            'data' => $qrCode,
        ], 201);
    }
}
