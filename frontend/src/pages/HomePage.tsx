import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useGetPostsQuery } from '../services/posts';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const { data: posts, isLoading, error } = useGetPostsQuery({});
  
  // Log posts data for debugging
  useEffect(() => {
    if (posts?.data) {
      console.log('Posts data:', posts.data);
      // Log the first post's fields if available
      if (posts.data.length > 0) {
        console.log('First post fields:', Object.keys(posts.data[0]));
      }
    }
  }, [posts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600">Error loading posts</h3>
        <p className="mt-2 text-sm text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Latest Posts</h1>
        <Link
          to="/create-post"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Post
        </Link>
      </div>

      <div className="space-y-8">
        {posts?.data?.length ? (
          posts.data.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="mt-2 text-sm text-gray-600">Be the first to create a post!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {posts?.pagination && (
        <nav
          className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-8"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{posts.pagination.start}</span> to{' '}
              <span className="font-medium">{posts.pagination.end}</span> of{' '}
              <span className="font-medium">{posts.pagination.total}</span> results
            </p>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end space-x-3">
            <button
              disabled={!posts.pagination.prev}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                posts.pagination.prev
                  ? 'bg-white text-gray-700 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <button
              disabled={!posts.pagination.next}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                posts.pagination.next
                  ? 'bg-white text-gray-700 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
