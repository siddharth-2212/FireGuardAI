import { pgTable, serial, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sensorStatusEnum = pgEnum("sensor_status", ["online", "offline", "warning", "critical"]);
export const fireRiskEnum = pgEnum("fire_risk", ["low", "medium", "high", "critical"]);

export const sensorsTable = pgTable("sensors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  status: sensorStatusEnum("status").notNull().default("online"),
  temperature: real("temperature").notNull().default(22),
  humidity: real("humidity").notNull().default(50),
  smokeLevel: real("smoke_level").notNull().default(0),
  coLevel: real("co_level").notNull().default(0),
  lastReading: timestamp("last_reading").notNull().defaultNow(),
  fireRisk: fireRiskEnum("fire_risk").notNull().default("low"),
});

export const insertSensorSchema = createInsertSchema(sensorsTable).omit({ id: true });
export type InsertSensor = z.infer<typeof insertSensorSchema>;
export type Sensor = typeof sensorsTable.$inferSelect;
