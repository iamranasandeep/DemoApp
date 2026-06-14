import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { app } from "../src/app";
import { query } from "../src/db/pool";

jest.mock("../src/db/pool", () => ({
  query: jest.fn()
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn()
}));

const mockedQuery = query as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;

describe("Inventory API", () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    mockedCompare.mockReset();
  });

  it("logs in with valid credentials", async () => {
    mockedCompare.mockResolvedValueOnce(true);
    mockedQuery
      .mockResolvedValueOnce({
        rows: [{ id: 1, username: "admin", password_hash: "$2b$10$4XJ5A5m3vF4NuR2ik7sQd.LebriG4J5hKRprqVIYjWnQ2QMmYfTgq" }]
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("creates a product when authenticated", async () => {
    const token = jwt.sign({ sub: 1, username: "admin" }, process.env.JWT_SECRET || "super-secret-key");

    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Widget", description: "Test", category_id: 1 }]
    });

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Widget", description: "Test", categoryId: 1 });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Widget");
  });

  it("lists products with pagination", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ total: "1" }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Widget", description: "Test", category_name: "General" }] });

    const response = await request(app).get("/api/products?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
  });

  it("rejects stock OUT when quantity is insufficient", async () => {
    const token = jwt.sign({ sub: 1, username: "admin" }, process.env.JWT_SECRET || "super-secret-key");

    mockedQuery
      .mockResolvedValueOnce({ rows: [{ quantity: 2 }] });

    const response = await request(app)
      .post("/api/inventory/movements")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: 1, warehouseId: 1, quantity: 5, movementType: "OUT" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Insufficient quantity");
  });

  it("returns live inventory with warehouse and total quantities", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        { warehouse_id: 1, warehouse_name: "North Hub", quantity: 10 },
        { warehouse_id: 2, warehouse_name: "South Hub", quantity: 5 }
      ]
    });

    const response = await request(app).get("/api/inventory/live/1");

    expect(response.status).toBe(200);
    expect(response.body.totalQuantity).toBe(15);
    expect(response.body.warehouses).toHaveLength(2);
  });

  it("returns product movement history", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        { id: 1, movement_type: "IN", quantity: 10, warehouse_name: "North Hub", created_at: "2026-01-01" }
      ]
    });

    const response = await request(app).get("/api/inventory/history/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].movement_type).toBe("IN");
  });
});
