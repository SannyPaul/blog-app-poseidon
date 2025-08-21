import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCommentMutation, useGetCommentsQuery } from '../services/comments';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import CommentItem from './CommentItem';
import type { Comment as CommentType } from '../services/types';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

type CommentsProps = {
  postId: string;
  initialComments?: (CommentType & {
    isDeleted?: boolean;
    updatedAt: string;
    author: {
      id: string;
      name: string;
      role?: string;
    };
  })[];
};

export default function Comments({ postId, initialComments = [] }: CommentsProps) {
  const { data, isLoading, error, refetch } = useGetCommentsQuery(
    { postId, limit: 100 },
    { skip: !postId, refetchOnMountOrArgChange: true }
  );
  
  const [createComment] = useCreateCommentMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const [localComments, setLocalComments] = useState<NonNullable<CommentsProps['initialComments']>>(initialComments || []);
  
  // Update local comments when initialComments or data changes
  useEffect(() => {
    if (data?.data) {
      setLocalComments(data.data);
    } else if (initialComments && initialComments.length > 0) {
      setLocalComments(initialComments);
    }
  }, [data, initialComments]);
  
  // Get top-level comments (those without a parent)
  const topLevelComments = localComments.filter(comment => !comment.parentId);

  const onSubmit = async (formData: CommentFormData) => {
    try {
      await createComment({
        postId,
        content: formData.content,
      }).unwrap();
      reset();
      // Refetch comments to show the new one
      refetch();
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <ErrorMessage message="Failed to load comments" />
        <button
          onClick={() => refetch()}
          className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Comments ({localComments.length})
        </h3>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            {...register('content')}
            className="flex-1 min-w-0 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Add a comment..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </form>

      <div className="space-y-4">
        {topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={postId}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}
