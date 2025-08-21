import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdatePostMutation, useGetPostByIdQuery } from '../services/posts';
import { toast } from 'react-hot-toast';
import { PhotoIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  summary: z.string().optional(),
  category: z.string().optional(),
  image: z.union([z.instanceof(File), z.string()]).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [updatePost] = useUpdatePostMutation();
  const { data: postData, isLoading: isLoadingPost, error } = useGetPostByIdQuery(id || '', { skip: !id });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  // Set form values when post data is loaded
  useEffect(() => {
    if (postData?.data) {
      const post = postData.data;
      reset({
        title: post.title,
        content: post.content,
        summary: post.summary || '',
        category: post.category || '',
      });
      if (post.image) {
        setPreviewImage(post.image);
      }
    }
  }, [postData, reset, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = useCallback(() => {
    setValue('image', '');
    setPreviewImage(null);
  }, [setValue]);

  const onSubmit = async (data: PostFormData) => {
    if (!id) return;

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.summary) formData.append('summary', data.summary);
    if (data.category) formData.append('category', data.category);
    if (typeof data.image === 'object' && data.image instanceof File) {
      formData.append('image', data.image);
    } else if (data.image === '') {
      formData.append('removeImage', 'true');
    }

    try {
      await updatePost({ id, data: formData }).unwrap();
      toast.success('Post updated successfully!');
      if (postData?.data?.slug) {
        navigate(`/post/${postData.data.slug}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to update post');
    }
  };

  if (isLoadingPost) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error || !postData?.data) {
    return <ErrorMessage message="Failed to load post" />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your post content and details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image
          </label>
          {previewImage ? (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="h-64 w-full object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <label className="bg-white p-1 rounded-md shadow-md hover:bg-gray-100 cursor-pointer">
                  <PhotoIcon className="h-5 w-5 text-gray-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-white p-1 rounded-md shadow-md hover:bg-gray-100"
                >
                  <div className="h-4 w-4 flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                </button>
              </div>
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
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <div className="space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Post
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
