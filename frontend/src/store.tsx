import { configureStore } from "@reduxjs/toolkit";
import roleReducer from "./slices/roleSlice";
import permissionReducer from "./slices/permissionSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";
import allOrderReducer from "./slices/allOrderSlice";
import shopperRequestReducer from "./slices/shopperRequestSlice";
import shipperOffersReducer from "./slices/shipperOffersSlice";
import shopperPaymentReducer from "./slices/shopperPaymentSlice";
import orderStatusReducer from "./slices/orderStatusSlice";
import getMessagesReduce from "./slices/getMessagesSlice";
import getAdminMessagesReduce from "./slices/getAdminMessagesSlice";

export const store = configureStore({
  reducer: {
    roles: roleReducer,
    permissions: permissionReducer,
    products: productReducer,
    order: orderReducer,
    allOrder: allOrderReducer,
    shopperRequest: shopperRequestReducer,
    shipperOffers: shipperOffersReducer,
    shopperPayments: shopperPaymentReducer,
    orderStatus: orderStatusReducer,
    getMessages: getMessagesReduce,
    getAdminMessages: getAdminMessagesReduce,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
