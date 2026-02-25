import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../../utils/ApiHelper";

interface messageState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: messageState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchShopperLatestMessages = createAsyncThunk(
  'getMessLatestages/fetch',
  async (_ , { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/shopper/messages/latest-messages`);
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

const shopperLatestChatsSlice = createSlice({
  name: "getLatestMessages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopperLatestMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopperLatestMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchShopperLatestMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default shopperLatestChatsSlice.reducer;
