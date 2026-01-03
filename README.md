# Purchase Tracker API

A RESTful API for tracking purchases, products, stores, and categories built with Hono, TypeScript, and PostgreSQL. This API also includes a Model Context Protocol (MCP) server for AI assistant integration.

## 🚀 Features

- **Product Management**: Create, read, update, and delete products
- **Store Management**: Manage store information and locations
- **Category Management**: Organize products by categories
- **Purchase Tracking**: Record and track purchases with detailed items
- **MCP Server**: Model Context Protocol server for AI assistant integration
- **Bearer Token Authentication**: Secure endpoints with bearer token validation
- **Database Migrations**: Automated database schema management with Drizzle ORM
- **Docker Support**: Full containerization with Docker Compose
- **Testing**: Comprehensive test suite with custom DSL
- **Code Quality**: ESLint, Prettier, and Husky for code quality

## 🛠️ Tech Stack

- **Runtime**: Node.js 22
- **Framework**: [Hono](https://hono.dev/) - Lightweight web framework
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: Node.js built-in test runner
- **Containerization**: Docker & Docker Compose
- **MCP**: Model Context Protocol for AI integration

## 📋 Prerequisites

- Node.js 22 or higher
- PostgreSQL database
- Docker and Docker Compose (optional)

## 🚦 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/raulnq/purchase-tracker-api
cd purchase-tracker-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/purchase_tracker
TOKEN=your-bearer-token-here
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL database
npm run database:up

# Run migrations
npm run database:migrate
```

#### Option B: Manual PostgreSQL Setup

1. Create a PostgreSQL database.
2. Update the `DATABASE_URL` in your `.env` file
3. Run migrations:

```bash
npm run database:migrate
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose --profile with-db up --build

# Or run without database (if you have external PostgreSQL)
docker-compose up --build
```

## 📚 API Documentation

### Authentication

All API endpoints require authentication via Bearer token in the Authorization header:

```bash
Authorization: Bearer your-bearer-token-here
```

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Products

- `GET /api/products` - List all products
- `POST /api/products` - Create a new product
- `GET /api/products/:productId` - Get product by ID
- `PUT /api/products/:productId` - Update product
- `POST /api/products/:productId/category/:categoryId` - Assign category to product
- `DELETE /api/products/:productId/category` - Assign category to product

#### Stores

- `GET /api/stores` - List all stores
- `POST /api/stores` - Create a new store
- `GET /api/stores/:storeId` - Get store by ID
- `PUT /api/stores/:storeId` - Update store

#### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/:categoryId` - Get category by ID
- `PUT /api/categories/:categoryId` - Update category

#### Purchases

- `GET /api/purchases` - List all purchases
- `POST /api/purchases` - Create a new purchase
- `GET /api/purchases/:purchaseId` - Get purchase by ID

### Health Check

```bash
GET /live
```

Returns server health status and uptime.

## 🤖 MCP Server

The API includes a Model Context Protocol server for AI assistant integration:

### MCP Endpoint

```
http://localhost:5000/mcp
```

### Available Tools

- `add_product` - Add a new product
- `list_products` - List all products
- `add_purchase` - Add a new purchase
- `add_store` - Add a new store
- `list_stores` - List all stores

### MCP Authentication

MCP endpoints also require Bearer token authentication:

```bash
Authorization: Bearer your-bearer-token-here
```

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

The project includes comprehensive tests with custom DSL for:

- Product management
- Store management
- Purchase tracking

## 🔧 Development Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run test suite
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run lint:format      # Fix lint issues and format code
npm run database:up      # Start PostgreSQL database with Docker
npm run database:down    # Stop PostgreSQL database
npm run database:stop    # Stop PostgreSQL database container
npm run database:generate # Generate database migrations
npm run database:migrate  # Run database migrations
npm run database:studio   # Open Drizzle Studio
```

## 📁 Project Structure

```
src/
├── app.ts                  # Main application setup
├── index.ts                # Server entry point
├── env.ts                  # Environment configuration
├── database/
│   ├── client.ts           # Database connection
│   └── schemas.ts          # Database schema definitions
├── features/
│   ├── categories/
│   │   ├── index.ts        # Route aggregation
│   │   ├── category.ts     # Schema and types
│   │   ├── add-category.ts
│   │   ├── edit-category.ts
│   │   ├── get-category.ts
│   │   └── list-categories.ts
│   ├── products/
│   │   ├── index.ts
│   │   ├── product.ts      # Schema and types
│   │   ├── add-product.ts
│   │   ├── edit-product.ts
│   │   ├── get-product.ts
│   │   ├── list-products.ts
│   │   ├── assign-category.ts
│   │   ├── remove-category.ts
│   │   └── get-product-purchase-history.ts
│   ├── purchases/
│   │   ├── index.ts
│   │   ├── purchase.ts     # Schema and types
│   │   ├── add-purchase.ts
│   │   ├── add-purchase-with-products.ts
│   │   ├── get-purchase.ts
│   │   └── list-purchases.ts
│   └── stores/
│       ├── index.ts
│       ├── store.ts        # Schema and types
│       ├── add-store.ts
│       ├── edit-store.ts
│       ├── get-store.ts
│       └── list-stores.ts
├── mcp/
│   ├── index.ts            # MCP route setup
│   └── server.ts           # MCP server configuration
├── middlewares/
│   ├── on-error.ts         # Error handling
│   └── on-not-found.ts     # 404 handling
├── types/
│   └── pagination.ts       # Pagination types
└── utils/
    ├── problem-document.ts # RFC 7807 problem details
    └── validation.ts       # Zod validation helpers

tests/
├── setup.ts                # Test setup and configuration
├── utils.ts                # Test utilities
├── assertions.ts           # Custom test assertions
├── products/
│   ├── product-dsl.ts      # Product test DSL
│   ├── add-product.test.ts
│   ├── list-products.test.ts
│   └── purchase-history.test.ts
├── purchases/
│   ├── purchase-dsl.ts     # Purchase test DSL
│   ├── add-purchase.test.ts
│   └── add-purchase-with-products.test.ts
└── stores/
    ├── store-dsl.ts        # Store test DSL
    ├── add-store.test.ts
    ├── edit-store.test.ts
    ├── get-store.test.ts
    └── list-stores.test.ts
```

## 📝 Database Schema

The database includes the following main entities:

- **Products**: Product information
- **Stores**: Store details
- **Categories**: Product categorization
- **Purchases**: Purchase records
- **Purchase Items**: Individual items within purchases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on the repository.
