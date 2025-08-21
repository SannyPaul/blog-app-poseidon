import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ReactionResponse {
  id: string;
  type: string;
  userId: string;
  postId: string;
  createdAt: string;
}

interface CreateReactionRequest {
  postId: string;
  type: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  if (result.error?.status === 401) {
    console.error('Authentication failed - token may be invalid or expired');
    localStorage.removeItem('token');
  }
  
  return result;
};

export const reactionsApi = createApi({
  reducerPath: 'reactionsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Reaction', 'Post'],
  endpoints: (builder) => ({
    createReaction: builder.mutation<ReactionResponse, CreateReactionRequest>({
      query: ({ postId, type }) => ({
        url: `/posts/${postId}/reactions`,
        method: 'PUT',
        body: { type },
      }),
      transformResponse: (response: any) => {
        // The actual reaction data is in response.data.reaction
        return response?.data?.reaction || response;
      },
      invalidatesTags: (_, __, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Reaction', id: postId },
      ],
    }),
    deleteReaction: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}/reactions`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Reaction', id: postId },
      ],
    }),
    getPostReactions: builder.query<ReactionResponse[], string>({
      query: (postId) => `/posts/${postId}/reactions`,
      transformResponse: (response: any) => {
        // The actual reactions array is in response.data.reactions
        return response?.data?.reactions || response || [];
      },
      providesTags: (result = [], _error, postId) => [
        { type: 'Reaction' as const, id: postId },
        ...result.map(({ id }) => ({ type: 'Reaction' as const, id: id || '' })),
      ],
    }),
  }),
});

export const {
  useCreateReactionMutation,
  useDeleteReactionMutation,
  useGetPostReactionsQuery,
} = reactionsApi;
