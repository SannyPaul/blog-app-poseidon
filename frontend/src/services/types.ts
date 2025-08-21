// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

// Post Types
export interface PostAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  image?: string;
  category?: string;
  author: PostAuthor;
  views: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Comment Types
export interface CommentAuthor {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: CommentAuthor;
  postId: string;
  parentId: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  likeCount?: number;
  userHasLiked?: boolean;
}

// Reaction Types
export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface Reaction {
  id: string;
  type: ReactionType;
  userId: string;
  postId: string;
  createdAt: string;
};

export interface UserReaction {
  type: ReactionType;
  userId: string;
  postId: string;
  createdAt: string;
};

// API Response Types
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  start: number;
  end: number;
  next: number | null;
  prev: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  name: string;
  confirmPassword: string;
}

export interface PostFormData {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  image?: File;
}

export interface CommentFormData {
  content: string;
  parentId?: string;
}

// Error Types
export interface ApiError {
  status: number;
  data: {
    success: boolean;
    error: string;
    message?: string | string[];
    stack?: string;
  };
}

export interface ValidationError {
  [key: string]: string[];
}

// Generic Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
