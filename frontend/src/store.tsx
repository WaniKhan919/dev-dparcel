import { configureStore } from "@reduxjs/toolkit";
import roleReducer from "./slices/roleSlice";
import permissionReducer from "./slices/permissionSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";

export const store = configureStore({
  reducer: {
    roles: roleReducer,
    permissions: permissionReducer,
    products: productReducer,
    order: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
