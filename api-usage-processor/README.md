# PrivacyPulse Hub API

NestJS API backend for the PrivacyPulse Hub Chrome Extension. Manages pulse survey evaluations, provides real-time averages, and tracks historical trends.

## Features

- **Guideline Management**: CRUD operations for team guidelines
- **Evaluation Submission**: Secure submission with de-duplication and consent validation
- **Real-time Aggregates**: Efficient daily statistics with UPSERT
- **Historical Data**: Trend analysis and performance tracking
- **Consent Management**: SHA-256 hashed consent validation system
- **Security**: Rate limiting, validation, and optional API keys
- **Timezone Support**: Configurable business timezone handling

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL 16+

### Local Development

1. **Clone and install dependencies**
   ```bash
   cd api-usage-processor
   pnpm install
   ```

2. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Start with Docker Compose (recommended)**
   ```bash
   # From root directory
   docker-compose up --build
   ```

4. **Or start manually**
   ```bash
   # Start PostgreSQL
   # Update .env with DB_HOST=localhost
   
   # Run migrations
   pnpm migrate
   
   # Start development server
   pnpm run dev
   ```

5. **Verify setup**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok"}
   ```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Guidelines
- `GET /guidelines` - Get today's guidelines with averages
- `GET /guidelines?date=YYYY-MM-DD` - Get guidelines for specific date
- `GET /guidelines/history?days=N` - Get historical trends (1-180 days)

### Evaluations
- `POST /evaluations` - Submit guideline evaluations
  - Rate limited: 60 requests per minute
  - Body size limit: 64KB
  - Max evaluations per request: 200
  - Requires active consent for external data sharing

### Consents
- `POST /consents` - Create consent for external data sharing
- `POST /consents/withdraw` - Withdraw consent
- `GET /consents/status/:deviceId/:version` - Check consent status

## Data Models

### Guidelines
```typescript
{
  id: string;           // Unique identifier (e.g., "g-001")
  text: string;         // Guideline description
  metadata: object;     // Category, version, etc.
  averagePercentage?: number;  // Today's team average
  totalResponses?: number;     // Number of responses today
}
```

### Evaluations
```typescript
{
  id: string;           // UUID
  guidelineId: string;  // Reference to guideline
  percentage: number;   // 0-100 score
  metadata: object;     // Additional context
  createdAt: Date;      // Submission timestamp
}
```

### Daily Aggregates
```typescript
{
  guidelineId: string;  // Reference to guideline
  date: Date;           // Business date
  count: number;        // Number of evaluations
  sum: number;          // Sum of percentages
  average: number;      // Calculated average
}
```

### Consents
```typescript
{
  id: number;           // Unique identifier
  deviceId: string;     // Device identifier
  consentVersion: string; // Consent agreement version
  consentTextHash: string; // SHA-256 hash of consent text
  disclaimerText: string; // Full disclaimer text
  agreedAt: Date;       // When consent was given
  evidence: string;      // How consent was given
  withdrawnAt?: Date;   // When consent was withdrawn
}
```

## Configuration

### Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=usage_db

# Timezone
APP_TIMEZONE=America/Sao_Paulo

# CORS
CORS_ORIGIN=http://localhost:3000,chrome-extension://*

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=60
BURST_TTL=5
BURST_MAX=10

# Request Limits
MAX_EVALUATIONS_PER_REQ=200
JSON_BODY_LIMIT=64kb

# Security
API_SHARED_KEY=dev-local-demo
```

## Database

### Migrations

The API includes pre-filled guidelines via migration:

```bash
# Run migrations
pnpm migrate

# Undo last migration
pnpm migrate:undo

# Undo all migrations
pnpm migrate:undo:all
```

### Schema

- **guidelines**: Core guideline definitions
- **evaluations**: Individual evaluation submissions
- **guideline_daily_aggregates**: Efficient daily statistics
- **submission_locks**: Prevents duplicate daily submissions

## Development

### Scripts

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run test         # Run tests
pnpm run migrate      # Run database migrations
```

### Architecture

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data operations
- **Models**: Sequelize ORM models with relationships
- **DTOs**: Data transfer objects with validation
- **Guards**: Rate limiting and security middleware

## Security Features

### Rate Limiting
- **Global**: 60 requests per minute
- **Burst**: 10 requests per 5 seconds
- **Custom key**: IP + deviceId combination

### Request Validation
- **Body size**: Maximum 64KB
- **Evaluation count**: Maximum 200 per request
- **Input validation**: Class-validator with DTOs

### Consent Management
- **SHA-256 validation**: Consent text hash verification
- **Device tracking**: Device ID-based consent validation
- **Withdrawal support**: Immediate consent withdrawal
- **Audit trail**: Complete consent history tracking

### CORS & Headers
- **CORS**: Configurable origins
- **Security headers**: Helmet.js integration
- **API keys**: Optional X-Client-Key header

## Production Deployment

### Docker

```bash
# Build image
docker build -t guideline-api .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  guideline-api
```

### Environment Setup

1. **Set production variables**
   ```bash
   NODE_ENV=production
   DB_HOST=your-production-db
   API_SHARED_KEY=your-secure-key
   ```

2. **Database setup**
   ```bash
   # Run migrations
   pnpm migrate
   ```

3. **Process management**
   ```bash
   # Use PM2 or similar
   pm2 start dist/main.js --name guideline-api
   ```

### Monitoring

- **Health endpoint**: `/health` for load balancers
- **Logging**: Structured logging with timestamps
- **Metrics**: Request counts and response times

## Testing

### Unit Tests
```bash
pnpm run test
```

### E2E Tests
```bash
pnpm run test:e2e
```

### Test Coverage
```bash
pnpm run test:cov
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

MIT License - see LICENSE file for details.
