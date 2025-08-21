import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePostMutation } from '../services/posts';
import { toast } from 'react-hot-toast';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  summary: z.string().optional(),
  category: z.string().optional(),
  image: z.instanceof(File).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setValue('image', undefined);
    setPreviewImage(null);
  };

  const onSubmit = async (data: PostFormData) => {
    console.log('Form data:', data);
    
    const postData = {
      title: data.title.trim(),
      content: data.content.trim(),
      ...(data.summary?.trim() && { summary: data.summary.trim() }),
      ...(data.category?.trim() && { category: data.category.trim() }),
      // Note: Image upload will need to be handled separately
    };

    console.log('Sending post data:', postData);

    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(postData)
      });

      const response = await result.json();
      
      if (!result.ok) {
        throw new Error(response.error || 'Failed to create post');
      }

      console.log('Create post response:', response);
      
      // Handle image upload if there's an image
      if (data.image) {
        const imageFormData = new FormData();
        imageFormData.append('file', data.image);
        
        const uploadResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/posts/${response.data._id}/photo`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: imageFormData
          }
        );
        
        if (!uploadResponse.ok) {
          console.error('Failed to upload image');
        }
      }

      toast.success('Post created successfully!');
      navigate('/');
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast.error(err.message || 'Failed to create post');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share your thoughts with the community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image (optional)
          </label>
          {previewImage ? (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="h-64 w-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Upload an image</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="title"
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.title
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              {...register('title')}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category (optional)
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="category"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              {...register('category')}
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <label
            htmlFor="summary"
            className="block text-sm font-medium text-gray-700"
          >
            Summary (optional)
          </label>
          <div className="mt-1">
            <textarea
              id="summary"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="A brief summary of your post"
              {...register('summary')}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <div className="mt-1">
            <textarea
              id="content"
              rows={15}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.content
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              {...register('content')}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Markdown is supported. Use # for headings, **bold**, *italic*, etc.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Publishing...
              </>
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
