import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface OfferState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: OfferState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchNewOffers = createAsyncThunk(
  'offers/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/shipper/get/new-offers`);
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

const shipperNewOffersSlice = createSlice({
  name: "newOffer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchNewOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default shipperNewOffersSlice.reducer;
