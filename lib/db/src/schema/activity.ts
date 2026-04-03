import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityTypeEnum = pgEnum("activity_type", ["detection", "sensor_update", "alert", "acknowledgment", "system"]);
export const activitySeverityEnum = pgEnum("activity_severity", ["info", "warning", "critical"]);

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  type: activityTypeEnum("type").notNull(),
  message: text("message").notNull(),
  sensorName: text("sensor_name").notNull(),
  severity: activitySeverityEnum("severity").notNull().default("info"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activityTable).omit({ id: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activityTable.$inferSelect;
