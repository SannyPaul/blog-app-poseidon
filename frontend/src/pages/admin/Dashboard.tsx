import { useAppSelector } from '../../hooks/useAppSelector';
import { useGetAllUsersQuery, useBanUserMutation, useUnbanUserMutation } from '../../services/admin';
import { useDeletePostMutation, useGetPostsQuery } from '../../services/posts';
import { toast } from 'react-hot-toast';
import type { Post } from '../../services/types';

const AdminDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetAllUsersQuery(undefined);
  const { data: postsResponse, isLoading: isLoadingPosts } = useGetPostsQuery({});
  const users = usersResponse?.data || [];
  const posts = postsResponse?.data || [];
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();
  const [deletePost] = useDeletePostMutation();

  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId).unwrap();
      toast.success('User banned successfully');
    } catch (err) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId).unwrap();
      toast.success('User unbanned successfully');
    } catch (err) {
      toast.error('Failed to unban user');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId).unwrap();
        toast.success('Post deleted successfully');
      } catch (err) {
        toast.error('Failed to delete post');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users Management</h2>
          {isLoadingUsers ? (
            <div className="text-center">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user._id} className="border-t">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {user.isBanned ? (
                          <button
                            onClick={() => handleUnbanUser(user._id)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(user._id)}
                            className="text-red-600 hover:text-red-800 mr-2"
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Posts Management</h2>
          {isLoadingPosts ? (
            <div className="text-center">Loading posts...</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post: Post) => (
                <div key={post.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-gray-600">By {post.author?.name || 'Unknown'}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
