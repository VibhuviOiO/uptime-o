import axios from 'axios';
import { createAsyncThunk, isFulfilled, isPending } from '@reduxjs/toolkit';
import { ASC } from 'app/shared/util/pagination.constants';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IQueryParams, createEntitySlice, EntityState, serializeAxiosError } from 'app/shared/reducers/reducer.utils';
import { IInstanceHeartbeat, defaultValue } from 'app/shared/model/instance-heartbeat.model';

const initialState: EntityState<IInstanceHeartbeat> = {
  loading: false,
  errorMessage: null,
  entities: [],
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false,
};

const apiUrl = 'api/instance-heartbeats';

export const getEntities = createAsyncThunk('instanceHeartbeat/fetch_entity_list', async ({ page, size, sort }: IQueryParams) => {
  const requestUrl = `${apiUrl}?${sort ? `page=${page}&size=${size}&sort=${sort}&` : ''}cacheBuster=${new Date().getTime()}`;
  return axios.get<IInstanceHeartbeat[]>(requestUrl);
});

export const getEntity = createAsyncThunk(
  'instanceHeartbeat/fetch_entity',
  async (id: string | number) => {
    const requestUrl = `${apiUrl}/${id}`;
    return axios.get<IInstanceHeartbeat>(requestUrl);
  },
  { serializeError: serializeAxiosError },
);

export const InstanceHeartbeatSlice = createEntitySlice({
  name: 'instanceHeartbeat',
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

export const { reset } = InstanceHeartbeatSlice.actions;

export default InstanceHeartbeatSlice.reducer;
