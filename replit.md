# Digital Synthesizer Application

## Overview

This is a modern digital synthesizer web application built with a React frontend and Express backend. The application allows users to create custom waveforms by drawing them on a canvas and then play them through a virtual keyboard with real-time audio synthesis. It features a comprehensive audio engine with envelope controls, filters, and effects processing.

## System Architecture

The application follows a monorepo structure with clear separation between client and server components:

- **Frontend**: React with TypeScript, using Vite for development and build processes
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **UI Framework**: shadcn/ui components with Tailwind CSS for styling
- **Audio Processing**: Web Audio API for real-time sound synthesis

## Key Components

### Frontend Architecture (`client/`)
- **React SPA**: Single-page application with component-based architecture
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks with TanStack Query for server state
- **Audio Engine**: Custom AudioEngine class using Web Audio API
- **UI Components**: Comprehensive set of shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with custom synthesizer color scheme

### Backend Architecture (`server/`)
- **Express Server**: RESTful API server with middleware for logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Development Setup**: Vite integration for hot reloading in development
- **Static Serving**: Serves built frontend files in production

### Database Schema (`shared/`)
- **User Model**: Basic user authentication schema with username/password
- **Shared Types**: TypeScript types and Zod schemas shared between client and server
- **Drizzle ORM**: PostgreSQL integration with type-safe database operations

### Audio System
- **Waveform Canvas**: Interactive drawing interface for custom waveform creation
- **Virtual Keyboard**: Piano-style interface with computer keyboard mapping
- **Audio Engine**: Real-time synthesis with custom waveforms and effects
- **Control Panel**: Envelope (ADSR), filter, and effects controls

## Data Flow

1. **Waveform Creation**: Users draw custom waveforms on HTML5 canvas
2. **Audio Synthesis**: Waveform data is converted to Web Audio API PeriodicWave
3. **Note Triggering**: Virtual keyboard or computer keys trigger note events
4. **Audio Processing**: Notes are processed through envelope, filter, and effects
5. **User Management**: Basic user system for potential future save/load functionality

## External Dependencies

### Audio Processing
- **Web Audio API**: Native browser audio synthesis and processing
- **Canvas API**: For waveform drawing and visualization

### UI and Styling
- **Radix UI**: Accessible component primitives via shadcn/ui
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for UI elements

### Database and Backend
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database toolkit
- **Express.js**: Web application framework

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

- **Development**: `npm run dev` starts both frontend and backend with hot reloading
- **Production Build**: `npm run build` creates optimized bundles for both client and server
- **Production Server**: `npm run start` serves the application in production mode
- **Database**: Uses PostgreSQL module with Drizzle migrations
- **Port Configuration**: Serves on port 5000 with external port 80

The deployment uses Replit's autoscale feature and includes proper environment variable handling for database connections.

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```