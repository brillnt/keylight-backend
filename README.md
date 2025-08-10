# Keylight Backend

Node.js/Express backend for the Keylight intake form system.

## Overview

This backend provides REST API endpoints for:
- Intake form submissions
- Admin dashboard data
- Email confirmation system
- PostgreSQL database integration

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Nodemailer (email)

## Database Schema

The application uses a single `intake_submissions` table with the following key fields:
- Contact details (name, email, phone, company)
- Buyer category (homebuyer, developer)
- Financing plans and preferences
- Land status and location details
- Build budget and timeline
- Project description
- Admin workflow fields (status, notes)

## API Endpoints

### Public Endpoints
- `POST /api/submissions` - Create new intake submission
- `GET /health` - Health check

### Admin Endpoints
- `GET /api/submissions` - List all submissions
- `GET /api/submissions/:id` - Get single submission
- `PUT /api/submissions/:id` - Update submission status/notes

## Environment Variables

```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Development

```bash
npm install
npm run dev
```

## Deployment

Deployed on Render.com as a Web Service.

