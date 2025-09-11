# Crop Trading and Inventory Management System

## Overview

This is a full-stack crop trading and inventory management system built with React.js frontend and Node.js/Express backend. The system enables users to buy crops from farmers, sell them to traders, and manage inventory, sales, and expenses. It includes comprehensive master data management for parties, cities, crops, and complete transaction workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand for authentication state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Authentication**: JWT-based stateless authentication
- **Password Hashing**: bcrypt for secure password storage
- **API Design**: RESTful APIs with proper HTTP status codes
- **Error Handling**: Centralized error middleware
- **Logging**: Custom request/response logging middleware

### Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- JWT-based authentication with refresh capabilities
- Role-based access control (admin/operator)
- Persistent authentication state using Zustand with localStorage
- Protected routes with middleware validation

### Master Data Management
- **Parties**: Farmers, traders, and exporters with contact information
- **Crops**: Agricultural products with units and base pricing
- **Locations**: States and cities for geographical organization
- **Users**: System users with role-based permissions

### Transaction Management
- **Purchases**: Recording crop purchases from farmers
- **Sales**: Managing sales to traders and exporters
- **Expenses**: Tracking business operational costs
- **Inventory**: Real-time stock tracking and valuation

### Reporting & Analytics
- **Dashboard**: Key metrics and performance indicators
- **Ledger**: Party-wise transaction history and balances
- **Inventory Reports**: Stock levels and valuation reports
- **Custom Reports**: Date range and party-specific filtering

### UI/UX Design
- **Design System**: Shadcn/ui components with New York style
- **Responsive Design**: Mobile-first approach with breakpoint handling
- **Dark Mode**: CSS variable-based theming support
- **Accessibility**: ARIA compliant components from Radix UI

## Data Flow

1. **Authentication Flow**:
   - User submits credentials → Backend validates → JWT token issued → Frontend stores token → Protected routes accessible

2. **Transaction Flow**:
   - User creates transaction → Form validation → API call with JWT → Database update → Inventory adjustment → Ledger entry creation

3. **Data Fetching**:
   - Component mounts → React Query triggers API call → JWT included in headers → Backend validates → Data returned → Component renders

4. **State Management**:
   - Authentication state in Zustand store
   - Server state cached by React Query
   - Form state managed by React Hook Form

## External Dependencies

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development and deployment platform

### Authentication & Security
- **jsonwebtoken**: JWT token generation and validation
- **bcrypt**: Password hashing and verification

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first styling

### Data Validation
- **Zod**: Schema validation for forms and API
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Zod integration for forms

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Environment variable configured connection
- **Build Process**: TypeScript compilation with Vite bundling

### Production Build
- **Frontend**: Vite build with optimized assets
- **Backend**: esbuild compilation for Node.js deployment
- **Static Assets**: Served through Express static middleware
- **Environment**: Production configuration with secure JWT secrets

### Key Configuration Files
- **Database**: `drizzle.config.ts` for ORM configuration
- **Build**: `vite.config.ts` for frontend bundling
- **Styling**: `tailwind.config.ts` for design system
- **TypeScript**: `tsconfig.json` with path aliases and strict mode

The system follows a modern full-stack architecture with emphasis on type safety, developer experience, and scalable design patterns. The modular structure allows for easy feature additions and maintenance.