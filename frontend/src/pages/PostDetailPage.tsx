import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  BookmarkIcon, 
  ShareIcon, 
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid, 
  BookmarkIcon as BookmarkIconSolid 
} from '@heroicons/react/24/solid';

import { useGetPostBySlugQuery, useGetPostByIdQuery } from '../services/posts';
import { 
  useCreateCommentMutation, 
  useGetCommentsQuery,
  useToggleReactionMutation 
} from '../services/comments';
import { useAppSelector } from '../hooks/useAppSelector';
import Comments from '../components/Comments';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

type CommentFormData = z.infer<typeof commentSchema>;

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Check if the slug is actually an ID (24 character hex string)
  const isId = Boolean(slug && /^[0-9a-fA-F]{24}$/.test(slug));
  
  // Use the appropriate query based on whether it's an ID or slug
  const { 
    data: postResponse, 
    isLoading, 
    error 
  } = isId 
    ? useGetPostByIdQuery(slug!, { skip: !slug })
    : useGetPostBySlugQuery(slug || '', { skip: !slug });
  
  // Safely extract post data
  const post = postResponse?.data;
  
  // Handle error state
  useEffect(() => {
    if (error) {
      if ('status' in error && error.status === 404) {
        toast.error('Post not found');
        navigate('/', { replace: true });
      } else {
        // Handle other types of errors
        toast.error('Failed to load post');
        console.error('Error loading post:', error);
      }
    }
  }, [error, navigate]);
  
  // Handle bookmark toggle
  const handleToggleBookmark = async (postId: string) => {
    if (!user) {
      toast.error('Please log in to bookmark posts');
      return;
    }
    
    if (!post) {
      toast.error('Post not found');
      return;
    }
    
    try {
      // For now, just show a success message based on the current state
      console.log(`Toggling bookmark for post ${postId}`);
      const action = post.isBookmarked ? 'Removed from' : 'Added to';
      toast.success(`${action} bookmarks`);
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };
  
  const { data: commentsResponse, isLoading: isLoadingComments } = useGetCommentsQuery(
    { postId: post?.id || '' },
    { skip: !post?.id }
  );
  
  // Safely extract comments data
  const commentsData = commentsResponse?.data || [];
  
  const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const { user } = useAppSelector((state) => state.auth);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!post) return;
    
    try {
      await createComment({
        postId: post.id,
        content: data.content,
      }).unwrap();
      reset();
      toast.success('Comment added successfully');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  });

  const handleToggleReaction = async (postId: string) => {
    if (!post) return;
    
    try {
      await toggleReaction({ postId, type: 'like' }).unwrap();
      // Update the local state to reflect the change immediately
      // The actual data will be refetched by RTK Query
    } catch (err) {
      toast.error('Failed to update reaction');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return <ErrorMessage message="Failed to load post" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white shadow overflow-hidden rounded-lg">
        {post.image && (
          <div className="h-96 bg-gray-200 overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                {post.author.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {post.author.name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                  {post.updatedAt !== post.createdAt && ' • Edited'}
                </p>
              </div>
            </div>
            {user?.id === post.author.id && (
              <button className="text-gray-400 hover:text-gray-600">
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {post.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-4">
              {post.category}
            </span>
          )}

          <div className="prose max-w-none mt-6">
            {post.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={() => handleToggleReaction(post.id)}
                  className="flex items-center text-gray-500 hover:text-red-500"
                  disabled={!user}
                  aria-label={post.userHasLiked ? 'Unlike post' : 'Like post'}
                >
                  {post.userHasLiked ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  <span className="ml-1">{post.likeCount}</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span className="ml-1">{post.commentCount}</span>
                </button>
              </div>
              <div className="flex space-x-2">
                {user && (
                  <button
                    onClick={() => handleToggleBookmark(post.id)}
                    className="text-gray-500 hover:text-yellow-500"
                    aria-label={post.isBookmarked ? 'Remove bookmark' : 'Add to bookmarks'}
                  >
                    {post.isBookmarked ? (
                      <BookmarkIconSolid className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Share post"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        
        {/* Add Comment Form */}
        <form onSubmit={onSubmit} className="mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <textarea
                {...register('content')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Write a comment..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        {isLoadingComments ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : post?.id ? (
          <Comments 
            postId={post.id} 
            initialComments={commentsData?.map(comment => ({
              ...comment,
              author: {
                id: comment.author.id,
                name: comment.author.name,
                role: comment.author.role
              },
              updatedAt: comment.updatedAt || new Date().toISOString(),
              isDeleted: comment.isDeleted || false
            }))} 
          />
        ) : null}
      </div>
    </div>
  );
}
