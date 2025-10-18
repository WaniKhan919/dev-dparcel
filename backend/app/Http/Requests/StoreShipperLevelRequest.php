<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreShipperLevelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'fee' => 'nullable|numeric|min:0',
            'max_orders' => 'required|integer|min:1',
            'max_locations' => 'required|integer|min:1',
            'status' => 'nullable|in:0,1',
            'shipping_type_ids' => 'nullable|array',
            'shipping_type_ids.*' => 'exists:shipping_types,id',
        ];
    }
}
