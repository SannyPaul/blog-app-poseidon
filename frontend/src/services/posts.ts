import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PostAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  image?: string;
  category?: string;
  author: PostAuthor;
  views: number;
  likeCount: number;
  commentCount: number;
  userHasLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pagination interface is not currently used but kept for future reference
// interface Pagination {
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
//   hasNext: boolean;
//   hasPrev: boolean;
// }

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    start: number;
    end: number;
    next: number | null;
    prev: number | null;
  };
}

type GetPostsParams = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
};

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<PaginatedResponse<Post>, GetPostsParams>({
      query: (params) => ({
        url: '/posts',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.category && { category: params.category }),
          ...(params.search && { search: params.search }),
          ...(params.sort && { sort: params.sort }),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),
    getPostBySlug: builder.query<{ data: Post }, string>({
      query: (slug) => ({
        url: `/posts/slug/${slug}`,
        headers: {
          // Don't send authorization header for public routes
          'Content-Type': 'application/json',
        },
      }),
      providesTags: (_, __, slug) => [{ type: 'Post', id: slug }],
    }),
    getPostById: builder.query<{ data: Post }, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (_, __, id) => [{ type: 'Post', id }],
    }),
    createPost: builder.mutation<Post, FormData>({
      query: (data) => ({
        url: '/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    updatePost: builder.mutation<Post, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: data,
      }),
      // Using _ to indicate intentionally unused parameters
      invalidatesTags: (_, __, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),
    deletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      // Using _ to indicate intentionally unused parameters
      invalidatesTags: () => [{ type: 'Post', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostBySlugQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;
