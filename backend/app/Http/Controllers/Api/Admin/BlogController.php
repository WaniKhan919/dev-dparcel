<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Blog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BlogController extends Controller
{
     /** List all blogs */
    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 10);

            $shippers = User::with('shipperProfile')
                ->whereHas('shipperProfile')
                ->latest()
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Shippers fetched successfully',
                'data'    => $shippers->items(),
                'meta'    => [
                    'current_page'  => $shippers->currentPage(),
                    'last_page'     => $shippers->lastPage(),
                    'per_page'      => $shippers->perPage(),
                    'total'         => $shippers->total(),
                    'next_page_url' => $shippers->nextPageUrl(),
                    'prev_page_url' => $shippers->previousPageUrl(),
                ],
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch blogs',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /** Create a new blog */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'title'            => 'required|string|max:255',
                'slug'             => 'nullable|string|unique:blogs,slug',
                'content'          => 'required|string',
                'excerpt'          => 'nullable|string',
                'author_name'      => 'nullable|string|max:255',
                'meta_title'       => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
                'meta_keywords'    => 'nullable|string',
                'canonical_url'    => 'nullable|string',
                'robots' => 'nullable',
                'category_id'      => 'nullable',
                'tags'             => 'nullable',
                'published_at'     => 'nullable|date',
            ]);

            // If slug is empty, auto-generate from title
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['title']);
            }

            $blog = Blog::create($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Blog created successfully',
                'data'    => $blog
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create blog',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /** Get single blog */
    public function show($id)
    {
        try {
            $blog = Blog::with('category')->find($id);

            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $blog,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch blog',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /** Update a blog */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $blog = Blog::find($id);
            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            $validated = $request->validate([
                'title'            => 'required|string|max:255',
                'slug'             => 'nullable|string|unique:blogs,slug,' . $id,
                'content'          => 'required|string',
                'excerpt'          => 'nullable|string',
                'author_name'      => 'nullable|string|max:255',
                'meta_title'       => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
                'meta_keywords'    => 'nullable|string',
                'canonical_url'    => 'nullable|string',
                'robots'           => 'nullable',
                'category_id'      => 'nullable|exists:categories,id',
                'tags'             => 'nullable|array',
                'published_at'     => 'nullable|date',
            ]);

            // Auto-generate slug if empty
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['title']);
            }

            $blog->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Blog updated successfully',
                'data'    => $blog,
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update blog',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /** Delete a blog */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $blog = Blog::find($id);
            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            $blog->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Blog deleted successfully',
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blog',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    
    public function broadcastEmail($blog_id)
    {
        try {
            $blog = Blog::findOrFail($blog_id);

             $users = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['shipper', 'shopper']);
            })->get();

            foreach ($users as $user) {

                $emailData = [
                    'user_name'        => $user->name,
                    'blog_title'       => $blog->title,
                    'blog_excerpt'     => $blog->excerpt,
                    'blog_content'     => $blog->content,
                    'blog_slug'        => $blog->slug,
                    'author_name'      => $blog->author_name,
                    'published_at'     => $blog->published_at,
                ];

                // ✅ Using your existing helper
                sendEmail(
                    $user->email,
                    $blog->title,
                    'emails.admin.blogs.broadcast-blog',
                    $emailData
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Blog broadcast email sent successfully'
            ]);

        } catch (Exception $e) {

            Log::error('Blog Broadcast Email Error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send broadcast email'
            ], 500);
        }
    }

}
