import { useState } from 'react';
import type { Comment as CommentType } from '../services/types';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useCreateCommentMutation, useDeleteCommentMutation, useUpdateCommentMutation } from '../services/comments';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectUser } from '../features/auth/authSlice';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

type CommentItemProps = {
  comment: CommentType & {
    isDeleted?: boolean;
    updatedAt: string;
    author: {
      id: string;
      name: string;
      role?: string;
    };
  };
  postId: string;
  level?: number;
  onReply?: () => void;
};

export default function CommentItem({ comment, postId, level = 0, onReply }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const user = useAppSelector(selectUser);
  const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: comment.content,
    },
  });

  const isAuthor = user?.id === comment.author.id;
  const canDelete = isAuthor || user?.role === 'admin';
  const canReply = !!user && !comment.isDeleted;
  const canEdit = isAuthor && !comment.isDeleted;

  const onSubmit = async (data: CommentFormData) => {
    try {
      await createComment({
        postId,
        content: data.content,
        parentId: comment.id,
      }).unwrap();
      reset();
      setIsReplying(false);
      onReply?.();
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment.id).unwrap();
        onReply?.();
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  const handleUpdate = async (data: CommentFormData) => {
    try {
      await updateComment({
        commentId: comment.id,
        content: data.content,
      }).unwrap();
      setIsEditing(false);
      onReply?.();
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  return (
    <div 
      className={`mt-4 ${level > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''}`}
      style={{ marginLeft: `${level * 1.5}rem` }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">
                {comment.author.name}
                {comment.author.role === 'admin' && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                    Admin
                  </span>
                )}
              </span>
              <span className="text-gray-500 ml-2">
                • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.updatedAt !== comment.createdAt && ' (edited)'}
              </span>
            </div>
          </div>
          {isEditing ? (
            <form onSubmit={handleSubmit(handleUpdate)} className="mt-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  {...register('content')}
                  className="flex-1 min-w-0 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="inline-flex justify-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </form>
          ) : (
            <p className="mt-1 text-sm text-gray-700">
              {comment.isDeleted ? '[Deleted]' : comment.content}
            </p>
          )}
          
          <div className="mt-2 flex space-x-4">
            {canReply && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {isReplying ? 'Cancel' : 'Reply'}
              </button>
            )}
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button 
                onClick={handleDelete}
                className="text-xs text-red-500 hover:text-red-700"
                disabled={isSubmitting}
              >
                Delete
              </button>
            )}
          </div>

          {isReplying && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  {...register('content')}
                  className="flex-1 min-w-0 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Write a reply..."
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
