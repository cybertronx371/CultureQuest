# ISP Management System

## Overview

This is a comprehensive ISP (Internet Service Provider) management web application built with React and Express. The system serves three distinct user roles: customers who can sign up for internet packages and submit support tickets, technicians who handle installations and repairs with GPS-tracked photo uploads, and administrators who oversee the entire operation. The application features real-time notifications, comprehensive ticket management, billing systems, and a complete user management interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development practices
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Password Security**: Native crypto module with scrypt for secure password hashing
- **Real-time Communication**: WebSocket integration for live notifications and updates
- **File Handling**: Multer middleware for image uploads with GPS coordinate extraction
- **API Design**: RESTful endpoints with role-based access control

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL with Neon serverless driver for scalable data persistence
- **Schema**: Comprehensive relational design including users, packages, tickets, bills, and network nodes
- **Sessions**: PostgreSQL-backed session storage for persistent authentication

### Security & Authentication
- **Session Management**: Express sessions with PostgreSQL store for scalability
- **Role-based Access**: Three-tier permission system (customer, technician, admin)
- **Password Security**: Salted hashing with timing-safe comparison
- **CSRF Protection**: Built-in session security measures

### Real-time Features
- **WebSocket Integration**: Real-time notifications for ticket updates and system events
- **GPS Tracking**: Automatic location capture when technicians upload proof photos
- **Live Updates**: Instant notification delivery without page refreshes

### Development Experience
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Hot Reload**: Vite development server with HMR for rapid development
- **Code Quality**: ESLint and TypeScript compiler checks
- **Build Process**: Optimized production builds with code splitting

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Consistent icon library for UI elements

### Development Tools
- **Vite**: Fast build tool with optimized development experience
- **Drizzle Kit**: Database migration and schema management tools
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

### Runtime Libraries
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with validation
- **Zod**: TypeScript-first schema validation
- **Date-fns**: Modern date utility library for formatting and manipulation