import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:root@localhost:5433/inventory_db",
  jwtSecret: process.env.JWT_SECRET || "super-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h"
};
