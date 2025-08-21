import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '../services/auth';
import { postsApi } from '../services/posts';
import { commentsApi } from '../services/comments';
import { reactionsApi } from '../services/reactions';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [commentsApi.reducerPath]: commentsApi.reducer,
    [reactionsApi.reducerPath]: reactionsApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      postsApi.middleware,
      commentsApi.middleware,
      reactionsApi.middleware
    ),
});

setupListeners(store.dispatch);

export { type RootState, type AppDispatch } from './types';
