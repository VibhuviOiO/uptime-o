import axios from 'axios';
import { createAsyncThunk, isFulfilled, isPending } from '@reduxjs/toolkit';
import { IQueryParams, createEntitySlice, EntityState, serializeAxiosError } from 'app/shared/reducers/reducer.utils';
import { IServiceHeartbeat } from 'app/shared/model/service-heartbeat.model';

const initialState: EntityState<IServiceHeartbeat> = {
  loading: false,
  errorMessage: null,
  entities: [],
  entity: {} as IServiceHeartbeat,
  updating: false,
  totalItems: 0,
  updateSuccess: false,
};

const apiUrl = 'api/service-heartbeats';

export const getEntities = createAsyncThunk('serviceHeartbeat/fetch_entity_list', async ({ page, size, sort }: IQueryParams) => {
  const requestUrl = `${apiUrl}?${sort ? `page=${page}&size=${size}&sort=${sort}&` : ''}cacheBuster=${new Date().getTime()}`;
  return axios.get<IServiceHeartbeat[]>(requestUrl);
});

export const getEntity = createAsyncThunk(
  'serviceHeartbeat/fetch_entity',
  async (id: string | number) => {
    const requestUrl = `${apiUrl}/${id}`;
    return axios.get<IServiceHeartbeat>(requestUrl);
  },
  { serializeError: serializeAxiosError },
);

export const ServiceHeartbeatSlice = createEntitySlice({
  name: 'serviceHeartbeat',
  initialState,
  extraReducers(builder) {
    builder
      .addMatcher(isFulfilled(getEntities), (state, action) => {
        const { data, headers } = action.payload;
        return {
          ...state,
          loading: false,
          entities: data,
          totalItems: parseInt(headers['x-total-count'], 10),
        };
      })
      .addMatcher(isFulfilled(getEntity), (state, action) => {
        state.loading = false;
        state.entity = action.payload.data;
      })
      .addMatcher(isPending(getEntities, getEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.loading = true;
      });
  },
});

export const { reset } = ServiceHeartbeatSlice.actions;

export default ServiceHeartbeatSlice.reducer;
