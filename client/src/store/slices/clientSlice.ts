import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,
};

export const fetchClients = createAsyncThunk('clients/fetchClients', async () => {
  const response = await api.get('/clients');
  return response.data;
});

export const fetchClient = createAsyncThunk('clients/fetchClient', async (id: number) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
});

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, ...clientData }: { id: number } & Partial<Client>) => {
    const response = await api.patch(`/clients/${id}`, clientData);
    return response.data;
  }
);

export const deleteClient = createAsyncThunk('clients/deleteClient', async (id: number) => {
  await api.delete(`/clients/${id}`);
  return id;
});

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch clients';
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.push(action.payload);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearError } = clientSlice.actions;
export default clientSlice.reducer;