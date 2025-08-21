import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/admin',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['User', 'Post'],
  endpoints: (builder) => ({
    // Get all users
    getAllUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    
    // Ban a user
    banUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/ban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),
    
    // Unban a user
    unbanUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/unban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
} = adminApi;
