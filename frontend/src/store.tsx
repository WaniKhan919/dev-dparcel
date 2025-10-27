import { configureStore } from "@reduxjs/toolkit";
import roleReducer from "./slices/roleSlice";
import permissionReducer from "./slices/permissionSlice";
import servicesReducer from "./slices/servicesSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";
import allOrderReducer from "./slices/allOrderSlice";
import shopperRequestReducer from "./slices/shopperRequestSlice";
import shipperOffersReducer from "./slices/shipperOffersSlice";
import shopperPaymentReducer from "./slices/shopperPaymentSlice";
import shipperPaymentReducer from "./slices/shipperPaymentSlice";
import orderStatusReducer from "./slices/orderStatusSlice";
import getMessagesReduce from "./slices/getMessagesSlice";
import getAdminMessagesReduce from "./slices/getAdminMessagesSlice";
import allPaymentReducer from "./slices/allPaymentSlice";
import notificationReducer from "./slices/notificationSlice";
import messageNotificationReducer from "./slices/messgeNotificationSlice";
import shippingTypeReducer from "./slices/shippingTypeSlice";

export const store = configureStore({
  reducer: {
    roles: roleReducer,
    permissions: permissionReducer,
    services: servicesReducer,
    products: productReducer,
    order: orderReducer,
    allOrder: allOrderReducer,
    shopperRequest: shopperRequestReducer,
    shipperOffers: shipperOffersReducer,
    shopperPayments: shopperPaymentReducer,
    shipperPayments: shipperPaymentReducer,
    orderStatus: orderStatusReducer,
    getMessages: getMessagesReduce,
    getAdminMessages: getAdminMessagesReduce,
    allPayments:allPaymentReducer,
    notification:notificationReducer,
    messageNotification:messageNotificationReducer,
    shippingType:shippingTypeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
