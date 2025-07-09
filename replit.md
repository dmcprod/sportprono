# Sports Prediction Platform

## Overview

This is a full-stack sports prediction web application built with React (frontend) and Express.js (backend). The platform provides sports predictions and analysis with a subscription-based model offering free and premium tiers. It features a modern, responsive design with dark/light theme support and comprehensive authentication through Replit Auth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Theme**: Light/dark mode support with custom CSS variables

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with Vite middleware in development

## Key Components

### Database Schema
- **Users**: Profile management with subscription tiers (free, pro, expert)
- **Predictions**: Sports predictions with premium/free classification
- **Blog Posts**: Content management for articles and analysis
- **User Prediction Access**: Granular access control for premium content
- **Sessions**: Secure session storage for authentication

### Authentication System
- Replit Auth integration with OpenID Connect
- Session-based authentication with PostgreSQL storage
- Role-based access control for premium features
- Automatic token refresh and session management

### Subscription System
- Three-tier model: Free, Pro, Expert
- Premium content access control
- Subscription expiry tracking
- Upgrade/downgrade functionality

### Data Models
- **Predictions**: Match data, teams, venues, championships, odds, analysis
- **Users**: Profile information, subscription status, access permissions
- **Blog**: Articles with categories, publication status, and metadata

## Data Flow

1. **Authentication Flow**:
   - User authenticates via Replit Auth
   - Server validates and creates session
   - Frontend receives user data and subscription status

2. **Prediction Access**:
   - User requests predictions (free or premium)
   - Server checks subscription status
   - Returns filtered content based on access level

3. **Content Management**:
   - Blog posts and predictions are created/updated via API
   - Content is categorized and filtered for display
   - Premium content requires authentication and subscription

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **express**: Web server framework
- **passport**: Authentication middleware

### UI Components
- **shadcn/ui**: Pre-built accessible components
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Wouter**: Lightweight routing

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety
- **ESBuild**: Production bundling
- **Replit plugins**: Development environment integration

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push`

### Environment Configuration
- Development: Hot reload with Vite middleware
- Production: Static file serving with Express
- Database: Environment-based connection strings
- Sessions: Secure configuration with environment secrets

### Project Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route components
│   │   └── hooks/       # Custom hooks
├── server/          # Express backend
│   ├── routes.ts    # API endpoints
│   ├── storage.ts   # Database operations
│   └── auth.ts      # Authentication logic
├── shared/          # Shared types and schemas
│   └── schema.ts    # Database schema
└── migrations/      # Database migrations
```

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: TanStack Query for efficient data fetching
- **Type Safety**: End-to-end TypeScript coverage
- **Security**: Session-based auth with CSRF protection
- **Performance**: Optimized builds and lazy loading
- **Accessibility**: ARIA-compliant components via Radix UI