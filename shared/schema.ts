import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Events schema for Notion data
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  notionId: text("notion_id").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  category: text("category").notNull(),
  categories: text("categories").array(), // New field for multiple categories
  location: text("location"),
  date: timestamp("date").notNull(),
  time: text("time"),
  price: text("price"),
  website: text("website"),
  organizer: text("organizer"),
  attendees: text("attendees"),
  imageUrl: text("image_url"),
  documentsUrls: text("documents_urls").array(), // For documents from Notion files property
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Categories enum for filtering
export const EVENT_CATEGORIES = [
  "musik",
  "theater", 
  "kunst",
  "sport",
  "food",
  "workshop",
  "festival",
  "other"
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];
