# Yugam 2025 - Event Management Portal

A comprehensive web-based event and workshop management system built for handling large-scale college festivals with 10,000+ participants and 200+ events.

## 🚀 Features

### Core Modules
- **Authentication & User Profiles** - Secure user registration and profile management
- **Event & Workshop Management** - Complete event lifecycle management with approval workflows
- **Payment Integration** - Secure payment processing with Razorpay
- **Team Management** - Create and manage teams for team-based events
- **Role-Based Access Control** - Granular permissions for different user roles
- **Notifications** - Browser push notifications and WhatsApp integration
- **Accommodation Management** - Handle participant accommodation requests
- **Content Management** - Dynamic content management system

### User Roles
- **Participant** - Register for events, join teams, make payments
- **Event Coordinator** - Manage assigned events
- **Workshop Coordinator** - Manage assigned workshops
- **Events Lead** - Oversee all events and coordinators
- **Workshops Lead** - Oversee all workshops and coordinators
- **Software Admin** - Technical system management
- **Overall Admin** - Complete system control

### Event Features
- **Multiple Event Types** - General, Paid, and Combo events
- **Flexible Registration** - Individual or team-based registration
- **Dynamic Forms** - Customizable registration forms
- **Payment Integration** - Per-person or per-team fee collection
- **Approval Workflow** - Events require approval before publishing
- **Registration Limits** - Control maximum participants per event

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with Shadcn/Radix UI components
- **React Router** for navigation
- **React Query** for state management
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Prisma ORM
- **JWT** for authentication
- **AWS S3** for file uploads
- **Web Push** for notifications
- **Razorpay** for payments

### Infrastructure
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Cloudflare CDN** for performance
- **Sentry** for error tracking
- **Mixpanel** for analytics

## 📁 Project Structure

```
yugam-2025/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions
│   │   └── ...
│   └── ...
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   └── ...
│   ├── prisma/             # Database schema and migrations
│   └── ...
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- AWS S3 bucket (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yugam-2025
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   
   Copy the provided `.env` files and update with your configuration:
   - `frontend/.env` - Frontend environment variables
   - `backend/.env` - Backend environment variables

4. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

## 🎨 Design Features

- **Responsive Design** - Mobile-first approach with perfect mobile experience
- **Dark/Light Mode** - Complete theme switching support
- **Accessibility** - WCAG-compliant design
- **Modern UI** - Clean, intuitive interface with smooth animations
- **Festival Branding** - Custom Yugam 2025 branding and color scheme

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Granular permission system
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - API rate limiting for security
- **CORS Protection** - Proper cross-origin resource sharing
- **Helmet.js** - Security headers and protection

## 📱 Mobile Features

- **Progressive Web App** - PWA capabilities for mobile experience
- **Push Notifications** - Browser and mobile push notifications
- **Offline Support** - Basic offline functionality
- **Touch Optimized** - Mobile-friendly interactions

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:
- Users with role-based permissions
- Events and workshops with approval workflows
- Teams and team memberships
- Registrations and payments
- Notifications and user notifications
- Accommodations and content management

## 🚀 Deployment

The application is designed for easy deployment with:
- Docker containerization
- Environment-based configuration
- Production-ready security settings
- CDN integration for static assets
- Database migration support

## 📊 Analytics & Monitoring

- **Mixpanel Integration** - User behavior analytics
- **Error Tracking** - Comprehensive error monitoring
- **Performance Monitoring** - Application performance insights
- **User Engagement** - Event registration and participation metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Yugam 2025

Built with ❤️ for the ultimate college festival experience. Join us for an unforgettable celebration of talent, innovation, and culture!