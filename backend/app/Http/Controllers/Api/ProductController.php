<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /** List all products */
    public function index()
    {
        try {
            $userId = Auth::id();

            $products = Product::with('user')
                ->where('user_id', $userId)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Products fetched successfully',
                'data'    => $products,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    /** Create a new product */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            
            $userId = Auth::id();
            $validated = $request->validate([
                'title'       => 'required|string|max:255',
                'description' => 'nullable|string',
                'product_url' => 'required|string',
                'quantity'    => 'required|integer|min:0',
                'price'       => 'required|numeric|min:0',
                'weight'      => 'nullable|numeric|min:0',
            ]);

            $validated['user_id'] = $userId;
            $product = Product::create($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product added successfully',
                'data'    => $product
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add product',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /** Get single product */
    public function show($id)
    {
        try {
            $product = Product::with('user')->find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $product,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    /** Update a product */
    public function update(Request $request,$id)
    {
        DB::beginTransaction();
        try {
            $product = Product::find($id);
            $validated = $request->validate([
                'user_id'     => 'required|exists:users,id',
                'title'       => 'required|string|max:255',
                'description' => 'nullable|string',
                'product_url' => 'required|string',
                'quantity'    => 'required|integer|min:0',
                'price'       => 'required|numeric|min:0',
                'weight'      => 'nullable|numeric|min:0',
            ]);

            $product->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data'    => $product,
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /** Delete a product */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $product = Product::find($id);
            $product->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
