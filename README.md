# Inventory Management System

Production-ready multi-warehouse inventory system with authentication, product management, stock movement tracking, and live quantity visibility.

## Topics Plan (Implementation Roadmap)

1. Domain and Data Modeling
- Define entities: users, categories, products, warehouses, inventory, stock movements
- Add relational constraints, indexes, and checks

2. Security and Authentication
- JWT login/logout
- Password hashing (bcrypt)
- Protected write APIs

3. Product Management
- Create products
- Paginated list
- Search and category filter

4. Warehouse and Inventory
- Pre-seeded 5 warehouses
- Stock IN and OUT operations
- Sufficient quantity validation on OUT

5. Inventory Visibility and History
- Warehouse-wise quantity per product
- Total quantity aggregation
- Product movement history view

6. Frontend UX
- React + TypeScript + Redux Toolkit
- Login/logout
- Product listing and search
- Live inventory display

7. Delivery and Operations
- Dockerized frontend/backend/postgres
- GitHub Actions CI for backend/frontend tests

## TDD Strategy Used

Backend and frontend were created with tests first for key behavior:
- Backend integration tests with Jest + Supertest in [backend/tests/app.test.ts](backend/tests/app.test.ts)
- Frontend tests with Vitest + React Testing Library in [frontend/src/__tests__/authSlice.test.ts](frontend/src/__tests__/authSlice.test.ts) and [frontend/src/__tests__/App.test.tsx](frontend/src/__tests__/App.test.tsx)

## Project Structure

- backend: Express + TypeScript + PostgreSQL access
- frontend: React + TypeScript + Redux + Tailwind + Axios
- database: schema and seed SQL
- .github/workflows: CI pipeline
- docker-compose.yml: local environment orchestration

## API Summary

- POST /api/auth/login
- POST /api/auth/logout
- POST /api/products
- GET /api/products?page=&limit=&search=&categoryId=
- GET /api/warehouses
- POST /api/inventory/movements
- GET /api/inventory/live/:productId
- GET /api/inventory/history/:productId

## Setup

### 1) Run with Docker

```bash
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:4000

### 2) Run locally

Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Database Scripts

- Schema: [database/schema.sql](database/schema.sql)
- Seed: [database/seed.sql](database/seed.sql)

Seed script includes:
- 5 warehouses
- 8 categories
- 1500 generated products
- inventory rows for all warehouse-product combinations

## Notes

- Default seeded user is `admin` in [database/seed.sql](database/seed.sql).
- Replace seeded password hash and JWT secret before production use.
