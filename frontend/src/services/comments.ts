import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Comment, PaginatedResponse } from './types';

type CommentResponse = {
  success: boolean;
  data: Comment;
};

type CommentsResponse = PaginatedResponse<Comment>;

type CreateCommentRequest = {
  postId: string;
  content: string;
  parentId?: string;
};

type UpdateCommentRequest = {
  commentId: string;
  content: string;
};

type DeleteCommentRequest = string; // commentId

type ToggleReactionRequest = {
  postId: string;
  type: string;
};

type GetCommentsParams = {
  postId: string;
  page?: number;
  limit?: number;
};

export const commentsApi = createApi({
  reducerPath: 'commentsApi',
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
  tagTypes: ['Comment'],
  endpoints: (builder) => ({
    getComments: builder.query<CommentsResponse, GetCommentsParams>({
      query: ({ postId, page = 1, limit = 10 }) => ({
        url: `/comments`,
        params: { postId, page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Comment' as const, id })),
              { type: 'Comment', id: 'LIST' },
            ]
          : [{ type: 'Comment', id: 'LIST' }],
    }),

    createComment: builder.mutation<CommentResponse, CreateCommentRequest>({
      query: ({ postId, content, parentId }) => ({
        url: '/comments',
        method: 'POST',
        body: { content, postId, parentId },
      }),
      invalidatesTags: (_result, _error, { parentId }) => 
        parentId 
          ? [
              { type: 'Comment' as const, id: 'LIST' },
              { type: 'Comment' as const, id: parentId }
            ]
          : [{ type: 'Comment' as const, id: 'LIST' }],
    }),

    updateComment: builder.mutation<CommentResponse, UpdateCommentRequest>({
      query: ({ commentId, content }) => ({
        url: `/comments/${commentId}`,
        method: 'PATCH',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { commentId }) => [
        { type: 'Comment' as const, id: commentId },
      ],
    }),

    deleteComment: builder.mutation<{ success: boolean; id: string }, DeleteCommentRequest>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Comment' as const, id },
        { type: 'Comment' as const, id: 'LIST' },
      ],
    }),

    toggleReaction: builder.mutation<{ success: boolean; data: { reaction: any } }, ToggleReactionRequest>({
      query: ({ postId, type }) => ({
        url: `/posts/${postId}/reactions`,
        method: 'POST',
        body: { type },
      }),
      invalidatesTags: () => [
        { type: 'Comment' as const, id: 'LIST' },
      ],
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        // Optimistic update for post like count
        const patchResult = dispatch(
          commentsApi.util.updateQueryData('getComments', { postId }, (draft) => {
            if (!draft) return;
            // Find the post in the cache and update like count
            // This is a simplified version - you might need to adjust based on your actual cache structure
            const post = draft.data.find((p) => p.id === postId);
            if (post) {
              post.likeCount = (post.likeCount || 0) + (post.userHasLiked ? -1 : 1);
              post.userHasLiked = !post.userHasLiked;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useToggleReactionMutation,
} = commentsApi;
