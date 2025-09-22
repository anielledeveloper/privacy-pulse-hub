# Changelog

All notable changes to the Team Guideline Pulse API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added
- Initial release of Team Guideline Pulse API
- NestJS framework with TypeScript support
- PostgreSQL database with Sequelize ORM
- Guideline management endpoints
- Evaluation submission with de-duplication and consent validation
- Daily aggregates with efficient UPSERT operations
- Historical trends endpoint
- Rate limiting and DoS protection
- Security headers and CORS configuration
- Optional API key authentication
- Timezone support for business date calculations
- Health check endpoint
- Comprehensive validation with class-validator
- Database migrations with pre-filled guidelines
- Docker support with health checks
- Consent management system with SHA-256 hashing
- Disclaimer validation and versioning
- Device-based consent tracking

### Technical Features
- MV3 architecture with service workers
- Incremental database updates
- Request size limits and validation
- Comprehensive error handling
- TypeScript strict mode
- ESLint and Prettier configuration
- Jest testing framework
- Production-ready Docker configuration

## [Unreleased]

### Planned
- User authentication and authorization
- Team management features
- Advanced analytics and reporting
- Webhook support for integrations
- Real-time updates via WebSockets
- Bulk guideline import/export
- Custom guideline categories
- Advanced rate limiting strategies
