import axios from 'axios';
import { createAsyncThunk, isPending } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { IHttpHeartbeatAggregated } from 'app/shared/model/http-heartbeat-aggregated.model';

const initialState: {
  loading: boolean;
  errorMessage: string | null;
  data: IHttpHeartbeatAggregated[];
} = {
  loading: false,
  errorMessage: null,
  data: [],
};

const apiUrl = 'api/http-heartbeats/aggregated';

export const getAggregatedHeartbeats = createAsyncThunk('httpHeartbeatAggregated/fetch_list', async (range: string) => {
  const requestUrl = `${apiUrl}?range=${range}`;
  return axios.get<IHttpHeartbeatAggregated[]>(requestUrl);
});

export const HttpHeartbeatAggregatedSlice = createSlice({
  name: 'httpHeartbeatAggregated',
  initialState,
  reducers: {
    reset(state) {
      state.loading = false;
      state.errorMessage = null;
      state.data = [];
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getAggregatedHeartbeats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addMatcher(isPending(getAggregatedHeartbeats), state => {
        state.errorMessage = null;
        state.loading = true;
      });
  },
});

export const { reset } = HttpHeartbeatAggregatedSlice.actions;

export default HttpHeartbeatAggregatedSlice.reducer;
