import { configureStore } from "@reduxjs/toolkit";
import roleReducer from "./slices/roleSlice";
import permissionReducer from "./slices/permissionSlice";

export const store = configureStore({
  reducer: {
    roles: roleReducer,
    permissions: permissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
