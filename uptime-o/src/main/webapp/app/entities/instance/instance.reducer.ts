import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IInstance, defaultValue } from 'app/shared/model/instance.model';
import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IInstance>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false,
};

const apiUrl = 'api/instances';

export const getEntities = createAsyncThunk('instance/fetch_entity_list', async ({ page, size, sort }: any) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return axios.get<IInstance[]>(requestUrl);
});

export const getEntity = createAsyncThunk(
  'instance/fetch_entity',
  async (id: string | number) => {
    const requestUrl = `${apiUrl}/${id}`;
    return axios.get<IInstance>(requestUrl);
  },
  { serializeError: serializeAxiosError },
);

export const createEntity = createAsyncThunk(
  'instance/create_entity',
  async (entity: IInstance, thunkAPI) => {
    const result = await axios.post<IInstance>(apiUrl, entity);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError },
);

export const updateEntity = createAsyncThunk(
  'instance/update_entity',
  async (entity: IInstance, thunkAPI) => {
    const result = await axios.put<IInstance>(`${apiUrl}/${entity.id}`, entity);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError },
);

export const deleteEntity = createAsyncThunk(
  'instance/delete_entity',
  async (id: string | number, thunkAPI) => {
    const requestUrl = `${apiUrl}/${id}`;
    const result = await axios.delete<IInstance>(requestUrl);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError },
);

export const InstanceSlice = createSlice({
  name: 'instance',
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entity = action.payload.data;
      })
      .addCase(deleteEntity.fulfilled, state => {
        state.updating = false;
        state.updateSuccess = true;
        state.entity = {};
      })
      .addMatcher(
        action => action.type.endsWith('/pending'),
        (state, action: any) => {
          state.errorMessage = null;
          state.updateSuccess = false;
          state.loading = true;
          if (!action.type.includes('fetch')) {
            state.updating = true;
          }
        },
      )
      .addMatcher(
        action => action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.loading = false;
          state.updating = false;
          state.updateSuccess = false;
          state.errorMessage = action.error?.message;
        },
      )
      .addMatcher(
        action => action.type.endsWith('/fulfilled') && (action.type.includes('create') || action.type.includes('update')),
        (state, action: any) => {
          state.updating = false;
          state.loading = false;
          state.updateSuccess = true;
          state.entity = action.payload.data;
        },
      )
      .addMatcher(
        action => action.type.endsWith('/fulfilled') && action.type.includes('fetch_entity_list'),
        (state, action: any) => {
          state.loading = false;
          state.entities = action.payload.data;
          state.totalItems = parseInt(action.payload.headers['x-total-count'], 10);
        },
      );
  },
});

export const { reset } = InstanceSlice.actions;
export default InstanceSlice.reducer;
