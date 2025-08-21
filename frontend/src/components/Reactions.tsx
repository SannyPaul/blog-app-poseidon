import { useState, useEffect } from 'react';
import { HeartIcon as HeartOutline, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { 
  useCreateReactionMutation, 
  useDeleteReactionMutation,
  useGetPostReactionsQuery 
} from '../services/reactions';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import toast from 'react-hot-toast';

type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

type ReactionProps = {
  postId: string;
  userReaction: ReactionType | null;
  likeCount: number;
  commentCount: number;
  onCommentClick?: (e: React.MouseEvent) => void;
};

function Reactions({ 
  postId, 
  userReaction: initialUserReaction, 
  likeCount: initialLikeCount, 
  commentCount,
  onCommentClick 
}: ReactionProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showReactions, setShowReactions] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  
  const [createReaction] = useCreateReactionMutation();
  const [deleteReaction] = useDeleteReactionMutation();
  const { data: reactionsData, refetch: refetchReactions } = useGetPostReactionsQuery(postId);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reactionRef = useOnClickOutside<HTMLDivElement>(() => {
    setShowReactions(false);
  });
  
  // Update local state when the initial props change
  useEffect(() => {
    setUserReaction(initialUserReaction);
    setLikeCount(initialLikeCount);
  }, [initialUserReaction, initialLikeCount]);
  
  // Update local state when reactions data changes
  useEffect(() => {
    if (reactionsData && Array.isArray(reactionsData)) {
      try {
        // Find the current user's reaction
        const currentUserReaction = reactionsData.find(
          (r: any) => r.user === localStorage.getItem('userId') || r.userId === localStorage.getItem('userId')
        )?.type as ReactionType | undefined;
        
        if (currentUserReaction) {
          setUserReaction(currentUserReaction);
        }
        
        // Calculate total like count
        const totalLikes = reactionsData.reduce(
          (sum: number, r: any) => sum + (r.type === 'like' ? 1 : 0), 0
        );
        setLikeCount(totalLikes);
      } catch (error) {
        console.error('Error processing reactions data:', error);
      }
    }
  }, [reactionsData]);

  const verifyAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found. Please log in.');
      // Optionally redirect to login page
      // navigate('/login');
      return false;
    }
    return true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReaction = async (type: ReactionType) => {
    if (!verifyAuth()) {
      toast.error('Please log in to react to posts');
      return;
    }

    console.log('handleReaction called with type:', type);
    console.log('Current userReaction:', userReaction);
    
    // Store previous state at the start
    const previousUserReaction = userReaction;
    const previousLikeCount = likeCount;
    
    // Update UI immediately for optimistic update
    setUserReaction(previousUserReaction === type ? null : type);
    
    if (type === 'like') {
      setLikeCount(previousUserReaction === 'like' ? likeCount - 1 : likeCount + 1);
    }
    
    try {
      // Make the API call
      if (previousUserReaction === type) {
        console.log('Removing reaction...');
        await deleteReaction({ postId }).unwrap();
        toast.success('Reaction removed');
      } else {
        console.log('Adding/Updating reaction...');
        await createReaction({ postId, type }).unwrap();
        toast.success('Reaction added');
      }
      
      setShowReactions(false);
      
      // Refetch reactions to ensure we have the latest data
      try {
        await refetchReactions();
      } catch (refetchError) {
        console.error('Error refetching reactions:', refetchError);
        // If refetch fails, revert to previous state
        setUserReaction(previousUserReaction);
        setLikeCount(previousLikeCount);
      }
    } catch (apiError: any) {
      console.error('API Error:', apiError);
      
      // Revert to previous state on error
      setUserReaction(previousUserReaction);
      setLikeCount(previousLikeCount);
      
      // Handle RTK Query error format
      const errorMessage = apiError?.data?.message || 
                         (typeof apiError?.error === 'string' ? apiError.error : 'Failed to update reaction. Please try again.');
      
      toast.error(errorMessage);
      
      // If unauthorized, clear token and redirect
      if (apiError?.status === 401) {
        localStorage.removeItem('token');
        // Optionally redirect to login
        // navigate('/login');
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reactionTypes: ReactionType[] = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const emojiMap: Record<ReactionType, string> = {
    like: '👍',
    love: '❤️',
    laugh: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠'
  };

  return (
    <div className="flex items-center space-x-4 mt-4 pt-2 border-t border-gray-100">
      <div className="flex items-center space-x-1">
        <div className="relative" ref={reactionRef}>
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(!showReactions);
            }}
          >
            {userReaction ? (
              <span className="text-xl">{emojiMap[userReaction]}</span>
            ) : (
              <HeartOutline className={`h-5 w-5 ${likeCount > 0 ? 'text-red-500' : 'text-gray-500'}`} />
            )}
          </button>
          
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 flex bg-white shadow-lg rounded-full p-1 space-x-1 z-10">
              {reactionTypes.map((type) => (
                <button
                  key={type}
                  className="text-xl hover:scale-125 transform transition-transform p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(type);
                  }}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                >
                  {emojiMap[type]}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-600">{likeCount}</span>
      </div>
      
      <button 
        onClick={onCommentClick}
        className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
      >
        <ChatBubbleLeftIcon className="h-5 w-5" />
        <span className="text-sm">{commentCount}</span>
      </button>
    </div>
  );
}

export default Reactions;
