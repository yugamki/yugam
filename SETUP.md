# Yugam 2025 - Setup Guide

This guide will help you set up and run the Yugam 2025 application with authentication.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/yugam_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="1d"
NODE_ENV="development"
PORT=3000
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

5. Start the backend server:
```bash
npm run dev
```

The backend will be running on `http://localhost:3000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## Testing the Authentication

### 1. Registration
1. Go to `http://localhost:5173/auth/register`
2. Fill out the registration form with your details
3. Submit the form
4. You'll be redirected to the dashboard upon successful registration

### 2. Login
1. Go to `http://localhost:5173/auth/login`
2. Enter your email and password
3. Submit the form
4. You'll be redirected based on your role:
   - Regular users → Dashboard
   - Admin users → Admin panel

### 3. Protected Routes
- `/dashboard` - Requires authentication
- `/admin/*` - Requires ADMIN role
- `/auth/login` and `/auth/register` - Public routes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Request/Response Examples

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+91 98765 43210",
    "college": "Example University",
    "year": "3rd Year",
    "department": "Computer Science"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Features Implemented

### Frontend
- ✅ Modern login page with form validation
- ✅ Registration page with comprehensive form
- ✅ Protected routes with role-based access
- ✅ User dashboard with profile information
- ✅ Authentication context and hooks
- ✅ Responsive design with dark mode support
- ✅ Header with dynamic navigation based on auth state

### Backend
- ✅ JWT-based authentication
- ✅ User registration with validation
- ✅ User login with password hashing
- ✅ Role-based access control
- ✅ CORS configuration for frontend
- ✅ Error handling middleware
- ✅ Database integration with Prisma

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check your DATABASE_URL in the .env file
   - Run `npx prisma migrate dev` to set up the database

2. **CORS Error**
   - The backend is configured to accept requests from `http://localhost:5173`
   - If using a different port, update the CORS configuration in `backend/src/server.ts`

3. **JWT Secret Error**
   - Ensure JWT_SECRET is set in your .env file
   - Use a strong, unique secret key

4. **Port Already in Use**
   - Change the PORT in your .env file
   - Update the frontend API URL accordingly

## Next Steps

- Implement password reset functionality
- Add email verification
- Create more admin features
- Add event and workshop management
- Implement payment integration
- Add real-time notifications 