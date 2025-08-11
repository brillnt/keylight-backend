# Keylight Backend

Modern ESM Node.js/Express backend for the Keylight intake form system.

## Architecture

This is a modern ESM-first Node.js application with clean separation of concerns:

```
src/
├── config/          # Environment and configuration
├── models/          # Data models and database access
├── routes/          # API route definitions
├── middleware/      # Express middleware
├── services/        # Business logic layer
└── app.js           # Express application setup

database/
├── migrations/      # Database schema migrations
└── seeds/          # Sample data for development

tests/              # Test files
server.js           # Application entry point
```

## Features

- **ESM-native**: Uses modern ES modules throughout
- **Clean Architecture**: Proper separation of concerns
- **Environment-based Config**: Flexible configuration management
- **Migration System**: Proper database schema management
- **Service Layer**: Business logic separated from routes
- **Comprehensive Testing**: Built for testability

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run database migrations
npm run migrate

# Seed development data
npm run seed

# Run tests
npm test
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
DATABASE_URL=postgresql://username:password@localhost:5432/keylight_intake_db
PORT=3000
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_PASSWORD=admin123
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/test-db` - Database connection test
- `POST /api/submissions` - Create submission
- `GET /api/submissions` - List submissions
- `GET /api/submissions/:id` - Get submission
- `PUT /api/submissions/:id` - Update submission

## Deployment

This application is designed to deploy on Render.com with managed PostgreSQL.

