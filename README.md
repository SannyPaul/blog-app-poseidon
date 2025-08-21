# Blog Application

A full-stack blog application built with modern web technologies, featuring user authentication, blog management, comments, and reactions.

## 🚀 Features

### Authentication & User Management
- [x] JWT-based authentication (Login/Register/Logout)
- [x] Role-based authorization (User/Admin)
- [x] Protected routes and API endpoints
- [x] User profile management

### Blog Posts
- [x] Create, Read, Update, Delete posts
- [x] Rich text content support
- [x] Post categories and tags
- [x] Search and filter posts

### Interactions
- [x] Comments with nested replies
- [x] Like/unlike posts
- [x] Bookmark posts
- [x] Share posts

### Admin Features
- [x] User management
- [x] Post moderation
- [x] Comment moderation

### Security
- [x] Password hashing with bcrypt
- [x] Rate limiting
- [x] CORS protection
- [x] Input validation
- [x] Secure HTTP headers

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Zod

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **UI Components**: Headless UI
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod
- **Date Handling**: date-fns
- **Styling**: TailwindCSS
- **Form Handling**: React Hook Form
- **Routing**: React Router DOM
- **Icons**: React Icons
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/blogapp
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   FILE_UPLOAD_PATH=./public/uploads
   MAX_FILE_UPLOAD=5000000
   RATE_LIMIT_WINDOW_MS=15*60*1000
   RATE_LIMIT_MAX=100
   ```

4. Start the backend server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_APP_NAME="MERN Blog"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📂 Project Structure

```
blog-app/
├── backend/               # Backend code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
│
└── frontend/             # Frontend code
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable UI components
        ├── features/     # Feature-based modules
        ├── hooks/        # Custom React hooks
        ├── pages/        # Page components
        ├── services/     # API services
        ├── store/        # Redux store
        ├── types/        # TypeScript types
        └── App.tsx       # Main component
```

## 🚀 Deployment

### Backend
1. Set `NODE_ENV=production` in your `.env` file
2. Build and start the production server:
   ```bash
   npm run build
   npm start
   ```

### Frontend
1. Update the `VITE_API_URL` in your `.env` file to point to your production backend
2. Build for production:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder to your preferred hosting service (Netlify, Vercel, etc.)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the MERN stack
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
