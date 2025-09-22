# ADR 002: Database Schema Design

## Status

Accepted

## Context

We need to design a database schema that efficiently handles:
- Guideline definitions and metadata
- Individual evaluation submissions
- Daily aggregated statistics
- Duplicate submission prevention
- Historical trend analysis
- High-volume read operations

## Decision

We designed a normalized schema with separate tables for different concerns and efficient aggregates.

### Core Tables

1. **guidelines** - Guideline definitions
2. **evaluations** - Individual submissions
3. **guideline_daily_aggregates** - Daily statistics
4. **submission_locks** - Duplicate prevention

### Key Design Decisions

- **Separate aggregates table** for efficient daily statistics
- **UPSERT operations** for incremental updates
- **Unique constraints** on (guidelineId, date) and (deviceId, date)
- **JSONB metadata** for flexible guideline properties
- **Date-based partitioning** for historical data

## Consequences

### Positive

- **Performance**: O(1) updates to daily aggregates
- **Scalability**: Efficient handling of high-volume submissions
- **Data Integrity**: Constraints prevent duplicate submissions
- **Flexibility**: JSONB allows metadata evolution
- **Analytics**: Fast historical queries via aggregates table
- **Storage**: Efficient storage with normalized design

### Negative

- **Complexity**: More complex schema than denormalized approach
- **Transactions**: Requires transaction management for consistency
- **Migration**: More complex migration scripts
- **Queries**: Some queries require joins

### Alternatives Considered

1. **Denormalized Approach**
   - Store everything in evaluations table
   - Pros: Simpler queries, single table
   - Cons: Poor performance for aggregates, data duplication

2. **Time-Series Database**
   - Use specialized time-series DB like InfluxDB
   - Pros: Optimized for time-based data
   - Cons: Additional infrastructure, learning curve

3. **Document Database**
   - Use MongoDB for flexible schema
   - Pros: Flexible metadata, JSON native
   - Cons: Less ACID compliance, complex aggregations

## Implementation

### Schema Structure

```sql
-- Guidelines table
CREATE TABLE guidelines (
  id VARCHAR PRIMARY KEY,
  text TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_id VARCHAR REFERENCES guidelines(id),
  percentage INTEGER CHECK (percentage >= 0 AND percentage <= 100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily aggregates table
CREATE TABLE guideline_daily_aggregates (
  guideline_id VARCHAR REFERENCES guidelines(id),
  date DATE NOT NULL,
  count INTEGER DEFAULT 0,
  sum INTEGER DEFAULT 0,
  average DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guideline_id, date)
);

-- Submission locks table
CREATE TABLE submission_locks (
  device_id VARCHAR NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(device_id, date)
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_evaluations_guideline_id ON evaluations(guideline_id);
CREATE INDEX idx_aggregates_date ON guideline_daily_aggregates(date);
CREATE INDEX idx_locks_date ON submission_locks(date);
```

### UPSERT Pattern

```sql
INSERT INTO guideline_daily_aggregates (guideline_id, date, count, sum, average)
VALUES ($1, $2, $3, $4, $4::float / NULLIF($3, 0))
ON CONFLICT (guideline_id, date)
DO UPDATE SET
  count = guideline_daily_aggregates.count + EXCLUDED.count,
  sum = guideline_daily_aggregates.sum + EXCLUDED.sum,
  average = (guideline_daily_aggregates.sum + EXCLUDED.sum)::float
            / NULLIF(guideline_daily_aggregates.count + EXCLUDED.count, 0),
  updated_at = NOW();
```

## References

- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Sequelize ORM](https://sequelize.org/)
- [Database Design Patterns](https://martinfowler.com/articles/microservices.html)
