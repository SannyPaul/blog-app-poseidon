import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfileMutation } from '../services/auth';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { logout as logoutAction } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [updateProfile] = useUpdateProfileMutation();
  const { 
    register, 
    handleSubmit: handleFormSubmit, 
    formState: { errors: formErrors } 
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    },
  });

  const handleLogout = () => {
    try {
      dispatch(logoutAction());
      // Clear local storage and redirect
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout');
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data).unwrap();
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to update profile');
    }
  };

  if (!user) {
    return <div>Please sign in to view your profile</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            {...register('name')}
          />
          {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            {...register('email')}
          />
          {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email.message}</p>}
        </div>

<div className="flex justify-between">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Logout
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
