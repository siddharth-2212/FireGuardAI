import { pgTable, serial, integer, text, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertSeverityEnum = pgEnum("alert_severity", ["info", "warning", "critical"]);

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  sensorId: integer("sensor_id").notNull(),
  sensorName: text("sensor_name").notNull(),
  location: text("location").notNull(),
  severity: alertSeverityEnum("severity").notNull().default("info"),
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  mlConfidence: real("ml_confidence").notNull().default(0),
  temperature: real("temperature").notNull().default(22),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
