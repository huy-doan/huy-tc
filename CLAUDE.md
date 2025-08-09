# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS backend application focused on financial market analysis, specifically implementing:
- **Candlestick Pattern Recognition**: Technical analysis patterns for trading signals
- **Harmonic Pattern Detection**: Advanced geometric patterns (Gartley, Bat, Butterfly, Crab, Cypher, Shark)
- **Binance API Integration**: Real-time market data collection and processing
- **PostgreSQL Database**: Data persistence with TypeORM migrations

## Common Development Commands

### Development
```bash
npm run start:dev        # Start in watch mode
npm run start:debug      # Start with debugging
npm run start:prod       # Production mode
```

### Building and Formatting
```bash
npm run build           # Build the application
npm run format          # Format code with Prettier
npm run lint            # Run ESLint with auto-fix
```

### Testing
```bash
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage
npm run test:e2e        # Run end-to-end tests
```

### Database Operations
```bash
npm run typeorm         # Run TypeORM CLI commands
npm run migration       # Run database migrations
docker-compose up -d    # Start PostgreSQL and Adminer (port 9081)
```

## Architecture Overview

### Module Structure
- **App Module**: Main application module importing all feature modules
- **User Module**: User management functionality
- **Binance Module**: Cryptocurrency market data integration
- **Point Module**: Data point collection and processing with scheduled tasks

### Core Libraries
- **Candlestick Analysis** (`src/libs/candlestick/`): Pattern recognition classes extending `CandlestickFinder`
- **Harmonic Patterns** (`src/libs/harmonic/patterns/`): Geometric pattern detection extending `HarmonicPatternBase`

### Configuration
- Database configuration uses environment variables through `env.config.ts`
- TypeORM configured in `orm.config.ts` with automatic entity loading and migrations
- Pattern-specific configurations in `harmonics.config.ts` with Fibonacci ratios for all 6 harmonic patterns
- Binance API credentials configured via environment variables

### Key Interfaces
- `CustomCandle`: Market data structure with OHLC + metadata
- `ChartResult`: Pattern detection results with price points
- `SwingResult`: Swing high/low analysis data

### Database Layer
- Entity-based design with separate migration folders per module
- Automatic migration execution on startup
- Test database isolation with `_unit_test` suffix

## Development Notes

- Uses path aliases with `~` prefix (configured in tsconfig)
- **Scheduled Data Collection**: `PointCronService` runs every minute to check and update points via Binance API
- Debugging enabled in harmonic pattern detection classes
- Pattern detection uses Fibonacci retracement calculations with precise ratio tolerances
- Points are grouped by symbol/interval for efficient API calls
- Test database automatically uses `_unit_test` suffix for isolation