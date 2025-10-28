<?php

use App\Http\Controllers\Api\Admin\ShipperLevelController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentPlanSettingController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SubscriptionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\PaymentSettingController;
use App\Http\Controllers\Api\Shipper\PaymentController as ShipperPaymentController;
use App\Http\Controllers\Api\StripeController;
use App\Http\Controllers\Api\ShipperController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RolePermissionController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/verify', [AuthController::class, 'verify']);
Route::post('/resend-code', [AuthController::class, 'resendCode']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin api routes
    Route::prefix('admin')->group(function () {
        Route::controller(MessageController::class)->group(function () {
            Route::get('/messages', 'getMessagesForAdmin');
            Route::post('/messages/status', 'updateMessageStatus');
        });

        Route::controller(AdminPaymentController::class)->group(function () {
            Route::get('/payments', 'index');
        });
        Route::prefix('/shipper-levels')->group(function () {
            Route::get('/', [ShipperLevelController::class, 'index']);
            Route::post('/store', [ShipperLevelController::class, 'store']);
            Route::get('/show{id}', [ShipperLevelController::class, 'show']);
            Route::put('/update{id}', [ShipperLevelController::class, 'update']);
            Route::delete('/destroy{id}', [ShipperLevelController::class, 'destroy']);
        });
        
        Route::prefix('/settings')->group(function () {
            Route::get('/payment', [PaymentSettingController::class, 'index']);
            Route::post('/payment', [PaymentSettingController::class, 'store']);
            Route::get('/payment/{id}', [PaymentSettingController::class, 'show']);
            Route::put('/payment/{id}', [PaymentSettingController::class, 'update']);
            Route::delete('/payment/{id}', [PaymentSettingController::class, 'destroy']);
        });
    });
    Route::get('/shipping-types', [ShipperLevelController::class, 'getShippingTypes']);
    Route::prefix('service')->group(function () {
        Route::controller(ServiceController::class)->group(function (){
            Route::get('/', 'index');
            Route::post('/store', 'store');
            Route::put('/update/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

    });

    // Permissions (Admin only)
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::post('/permissions', [PermissionController::class, 'store']);
    Route::get('/permission/{id}', [PermissionController::class, 'show']);
    Route::put('/permissions/{permission}', [PermissionController::class, 'update']);
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy']);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);

    // Role Permission assignment
    Route::post('/roles/{role}/permissions', [RolePermissionController::class, 'assign']);
    Route::get('/roles/{role}/permissions', [RolePermissionController::class, 'getPermissions']);
    Route::delete('/roles/{role}/permissions/{permission}', [RolePermissionController::class, 'revoke']);

    // User Pofile
    Route::put('/update-profile', [UserController::class, 'updateProfile']);
    Route::put('/update-password', [UserController::class, 'updatePassword']);

    //  Product Routes Shopper
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{permission}', [ProductController::class, 'update']);
    Route::delete('/products/{permission}', [ProductController::class, 'destroy']);
    
    Route::prefix('order')
    ->controller(OrderController::class)
    ->group(function () {
        Route::get('/', 'index');
        Route::get('/all/orders', 'allOrders');
        Route::post('/store', 'store');
        Route::get('/shipper/offers/{orderId}', 'getShipperOffers');
        Route::post('/offer/{offerId}/status', 'offerStatus');
        Route::get('/statuses', 'getOrderStatuses');
        Route::post('/update-status',  'updateStatus');
        Route::get('/get-order-tracking/{id}',  'getOrderTracking');
        Route::get('/get-order-detail/{id}',  'getOrderDetail');
    });
    
    Route::prefix('shipper')->group(function () {
        Route::controller(ShipperController::class)
        ->group(function () {
            Route::get('/get/requests', 'getRequests');
            Route::post('/confirm/request', 'confirmRequest');
            Route::get('/get/offers', 'getMyOffers');

        });
        Route::get('/payments', [ShipperPaymentController::class, 'index']);
        Route::get('/levels', [SubscriptionController::class, 'index']);
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
    });
    Route::prefix('shopper')->group(function () {
        Route::get('/payments', [PaymentController::class, 'index']);
    });
    Route::post('/create-payment-intent', [StripeController::class, 'createPaymentIntent']);
    Route::post('/store-payment', [StripeController::class, 'storePayment']);

    Route::prefix('messages')
    ->controller(MessageController::class)
    ->group(function () {
        Route::get('/', 'index');
        Route::post('/send', 'store');

    });

    Route::prefix('notifications')
    ->controller(NotificationController::class)
    ->group(function () {
        Route::get('/', 'index');
        Route::post('/{id}/read', 'markAsRead');
        Route::post('/read-all', 'markAllAsRead');
    });
    Route::prefix('plans')
    ->controller(PaymentPlanSettingController::class)
    ->group(function () {
        Route::get('/', 'getPaymentPlans');
    });


});
