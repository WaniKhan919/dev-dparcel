<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Country;
use App\Models\State;
use App\Models\City;
use Exception;
use Illuminate\Support\Facades\Auth;

class LocationController extends Controller
{
    /**
     * Get all countries
     */
    public function getCountries(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized user.',
                ], 401);
            }

            $countries = Country::orderBy('name')->get(['id', 'name', 'iso2', 'iso3', 'phonecode']);

            return response()->json([
                'status' => true,
                'message' => 'Countries fetched successfully.',
                'data' => $countries,
            ]);
        } catch (Exception $ex) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch countries.',
                'error' => $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all states by country_id
     */
    public function getStates(Request $request, $country_id)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized user.',
                ], 401);
            }

            $states = State::where('country_id', $country_id)
                ->orderBy('name')
                ->get(['id', 'name', 'country_id', 'iso2']);

            if ($states->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No states found for this country.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'States fetched successfully.',
                'data' => $states,
            ]);
        } catch (Exception $ex) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch states.',
                'error' => $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all cities by state_id
     */
    public function getCitiesByState(Request $request, $state_id)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized user.',
                ], 401);
            }

            $cities = City::where('state_id', $state_id)
                ->orderBy('name')
                ->get(['id', 'name', 'state_id', 'country_id']);

            if ($cities->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No cities found for this state.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Cities fetched successfully.',
                'data' => $cities,
            ]);
        } catch (Exception $ex) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch cities.',
                'error' => $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all cities by country_id (optional)
     */
    public function getCitiesByCountry(Request $request, $country_id)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized user.',
                ], 401);
            }

            $cities = City::where('country_id', $country_id)
                ->orderBy('name')
                ->get(['id', 'name', 'country_id', 'state_id']);

            if ($cities->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No cities found for this country.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Cities fetched successfully.',
                'data' => $cities,
            ]);
        } catch (Exception $ex) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch cities.',
                'error' => $ex->getMessage(),
            ], 500);
        }
    }
}
