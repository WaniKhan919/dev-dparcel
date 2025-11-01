<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\State;
use App\Models\City;

class CountriesStatesCitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        $json = file_get_contents(public_path('world.json'));

        $data = json_decode($json, true);

        foreach ($data as $countryData) {
            $country = Country::create([
                'id' => $countryData['id'],
                'name' => $countryData['name'],
                'iso3' => $countryData['iso3'] ?? null,
                'iso2' => $countryData['iso2'] ?? null,
                'numeric_code' => $countryData['numeric_code'] ?? null,
                'phonecode' => $countryData['phonecode'] ?? null,
                'capital' => $countryData['capital'] ?? null,
                'currency' => $countryData['currency'] ?? null,
                'currency_name' => $countryData['currency_name'] ?? null,
                'currency_symbol' => $countryData['currency_symbol'] ?? null,
                'timezone' => $countryData['timezones'][0]['zoneName'] ?? null,
                'latitude' => $countryData['latitude'] ?? null,
                'longitude' => $countryData['longitude'] ?? null,
            ]);

            if (!empty($countryData['states'])) {
                foreach ($countryData['states'] as $stateData) {
                    $state = State::create([
                        'id' => $stateData['id'],
                        'country_id' => $country->id,
                        'name' => $stateData['name'],
                        'iso2' => $stateData['iso2'] ?? null,
                        'latitude' => $stateData['latitude'] ?? null,
                        'longitude' => $stateData['longitude'] ?? null,
                        'type' => $stateData['type'] ?? null,
                    ]);

                    if (!empty($stateData['cities'])) {
                        foreach ($stateData['cities'] as $cityData) {
                            City::create([
                                'id' => $cityData['id'],
                                'state_id' => $state->id,
                                'country_id' => $country->id,
                                'name' => $cityData['name'],
                                'latitude' => $cityData['latitude'] ?? null,
                                'longitude' => $cityData['longitude'] ?? null,
                            ]);
                        }
                    }
                }
            }
        }
    }
}
