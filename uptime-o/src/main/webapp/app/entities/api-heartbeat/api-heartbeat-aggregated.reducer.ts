import axios from 'axios';
import { createAsyncThunk, isPending } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { IApiHeartbeatAggregated } from 'app/shared/model/api-heartbeat-aggregated.model';

const initialState: {
  loading: boolean;
  errorMessage: string | null;
  data: IApiHeartbeatAggregated[];
} = {
  loading: false,
  errorMessage: null,
  data: [],
};

const apiUrl = 'api/api-heartbeats/aggregated';

export const getAggregatedHeartbeats = createAsyncThunk('apiHeartbeatAggregated/fetch_list', async (range: string) => {
  const requestUrl = `${apiUrl}?range=${range}`;
  return axios.get<IApiHeartbeatAggregated[]>(requestUrl);
});

export const ApiHeartbeatAggregatedSlice = createSlice({
  name: 'apiHeartbeatAggregated',
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

export const { reset } = ApiHeartbeatAggregatedSlice.actions;

export default ApiHeartbeatAggregatedSlice.reducer;
