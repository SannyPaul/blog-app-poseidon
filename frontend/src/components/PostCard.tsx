import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { EyeIcon, ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Reactions from './Reactions';
import type { Post } from '../services/posts';

type PostCardProps = {
  post: Post;
};

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  
  // Log the post data to debug the slug issue
  useEffect(() => {
    console.log('PostCard received post:', {
      id: post.id,
      slug: post.slug,
      title: post.title,
      // Add other relevant fields
    });
  }, [post]);
  
  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Comment clicked for post:', { id: post.id, slug: post.slug });
    
    // If we have a slug, use it
    if (post.slug) {
      console.log('Navigating with slug:', post.slug);
      navigate(`/post/${post.slug}#comments`);
    } 
    // Fallback to using the post ID if slug is not available
    else if (post.id) {
      console.log('Falling back to using ID:', post.id);
      navigate(`/post/${post.id}#comments`);
    }
    // If neither is available, show an error
    else {
      console.error('Post slug and ID are undefined', { post });
      toast.error('Unable to load post');
    }
  };
  return (
    <article className="bg-white shadow overflow-hidden rounded-lg">
      {post.image && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              {post.author.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.author.name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {post.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {post.category}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          <Link 
            to={`/post/${post.slug}`}
            className="hover:text-indigo-600 transition-colors duration-200"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 text-base text-gray-600 line-clamp-2">
          {post.summary || post.content.substring(0, 200)}...
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{post.views || 0}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              <span>{post.commentCount || 0} comments</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <HeartIcon className="h-4 w-4 mr-1 text-red-500" />
              <span>{post.likeCount || 0}</span>
            </div>
          </div>
          <div className="text-sm">
            <Link
              to={`/post/${post.slug}`}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Read more →
            </Link>
          </div>
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <Reactions 
            postId={post.id}
            userReaction={post.userHasLiked ? 'like' : null}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            onCommentClick={handleCommentClick}
          />
        </div>
      </div>
    </article>
  );
};

export default PostCard;
