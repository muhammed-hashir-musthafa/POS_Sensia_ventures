import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

interface Order {
  id: number;
  clientId: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod1?: string;
  paymentAmount1?: number;
  paymentMethod2?: string;
  paymentAmount2?: number;
  client: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const response = await api.get('/orders');
  return response.data;
});

export const fetchOrder = createAsyncThunk('orders/fetchOrder', async (id: number) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
});

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: {
    clientId: number;
    items: { productId: number; quantity: number }[];
    paymentMethod1?: string;
    paymentAmount1?: number;
    paymentMethod2?: string;
    paymentAmount2?: number;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, ...orderData }: { id: number } & Partial<Order>) => {
    const response = await api.patch(`/orders/${id}`, orderData);
    return response.data;
  }
);

export const deleteOrder = createAsyncThunk('orders/deleteOrder', async (id: number) => {
  await api.delete(`/orders/${id}`);
  return id;
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload);
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o.id !== action.payload);
      });
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;