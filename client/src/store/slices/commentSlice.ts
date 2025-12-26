import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface Comment {
  id: number;
  content: string;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CommentState {
  comments: Comment[];
  currentComment: Comment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  currentComment: null,
  isLoading: false,
  error: null,
};

export const fetchComments = createAsyncThunk('comments/fetchComments', async () => {
  const response = await api.get('/comments');
  return response.data;
});

export const fetchComment = createAsyncThunk('comments/fetchComment', async (id: number) => {
  const response = await api.get(`/comments/${id}`);
  return response.data;
});

export const createComment = createAsyncThunk(
  'comments/createComment',
  async (commentData: { content: string }) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ id, content }: { id: number; content: string }) => {
    const response = await api.patch(`/comments/${id}`, { content });
    return response.data;
  }
);

export const deleteComment = createAsyncThunk('comments/deleteComment', async (id: number) => {
  await api.delete(`/comments/${id}`);
  return id;
});

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearError } = commentSlice.actions;
export default commentSlice.reducer;