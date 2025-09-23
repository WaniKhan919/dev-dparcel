import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface DataType {
  page?: number;
  per_page?: number;
}
interface OrderRequestState {
  data: any[];
  meta: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderRequestState = {
  data: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchAllOrders = createAsyncThunk(
  'allOrderRequest/fetch',
  async ({ page = 1, per_page = 10 }:DataType, { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/order/all/orders?page=${page}&per_page=${per_page}`);
      if (response.status === 200 && response.data?.data) {
        return response.data;
      } else {
        return rejectWithValue(response.data?.message || 'Error fetching');
      }
    } catch (err:any) {
      return rejectWithValue(err.message || 'Error fetching');
    }
  }
);

const allOrderSlice = createSlice({
  name: "allOrder",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default allOrderSlice.reducer;
