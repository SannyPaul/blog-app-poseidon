# Blog Application - Backend

This is the backend API for the Blog Application, built with Node.js, Express, MongoDB, and TypeScript.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Protected routes

- **Core Features**
  - User management
  - Blog post management
  - Comments with nested replies
  - Reactions (likes, bookmarks)
  - Search and filtering

- **Security**
  - Rate limiting
  - Data sanitization
  - Secure headers
  - Input validation with Zod

- **Developer Experience**
  - TypeScript support
  - API documentation with Swagger
  - Error handling middleware
  - Logging

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## 📦 Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blog-app.git
   cd blog-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/blogapp
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   FILE_UPLOAD_PATH=./public/uploads
   MAX_FILE_UPLOAD=5000000
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Run the application**
   - Development: `npm run dev`
   - Production: `npm start`
   - Build: `npm run build`

5. **Access the API**
   - API Base URL: `http://localhost:5000/api/v1`
   - API Documentation: `http://localhost:5000/api-docs`

## 🧪 Testing

Run tests with:

```bash
npm test
# or
yarn test
```

## 📝 API Documentation

API documentation is available at `/api-docs` when the server is running. It provides:
- Interactive API documentation
- Request/response schemas
- Example requests

## 🔧 Development

### Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   ├── app.ts        # Express app setup
│   └── server.ts     # Server entry point
├── .env              # Environment variables
├── package.json
└── tsconfig.json
```

### Code Style

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Write meaningful commit messages

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/)

## Testing

Run tests with:
```bash
npm test
```

## Security

- Helmet for setting various HTTP headers
- Data sanitization against NoSQL injection
- XSS protection
- Rate limiting
- HTTP parameter pollution protection
- JWT authentication
- Secure HTTP headers

## Deployment

1. Set `NODE_ENV=production`
2. Update CORS and other production settings
3. Use PM2 or similar process manager
4. Set up SSL/TLS

## License

MIT
