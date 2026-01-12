import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Accessibility preferences
  fontSize: mysqlEnum("fontSize", ["normal", "large", "extra-large"]).default("large").notNull(),
  highContrast: boolean("highContrast").default(true).notNull(),
  voiceNavigation: boolean("voiceNavigation").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lifts/Elevators data from EMSD
 */
export const lifts = mysqlTable("lifts", {
  id: int("id").autoincrement().primaryKey(),
  liftNumber: varchar("liftNumber", { length: 100 }).notNull().unique(),
  location: text("location").notNull(),
  address: text("address"),
  district: varchar("district", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  type: varchar("type", { length: 100 }), // passenger, goods, etc.
  isAccessible: boolean("isAccessible").default(true).notNull(),
  isOperational: boolean("isOperational").default(true).notNull(),
  lastInspection: timestamp("lastInspection"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdx: index("location_idx").on(table.latitude, table.longitude),
  districtIdx: index("district_idx").on(table.district),
}));

export type Lift = typeof lifts.$inferSelect;
export type InsertLift = typeof lifts.$inferInsert;

/**
 * Footbridges maintained by Highways Department
 */
export const footbridges = mysqlTable("footbridges", {
  id: int("id").autoincrement().primaryKey(),
  bridgeNumber: varchar("bridgeNumber", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  district: varchar("district", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  hasLift: boolean("hasLift").default(false).notNull(),
  hasEscalator: boolean("hasEscalator").default(false).notNull(),
  hasRamp: boolean("hasRamp").default(false).notNull(),
  isAccessible: boolean("isAccessible").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdx: index("location_idx").on(table.latitude, table.longitude),
  accessibleIdx: index("accessible_idx").on(table.isAccessible),
}));

export type Footbridge = typeof footbridges.$inferSelect;
export type InsertFootbridge = typeof footbridges.$inferInsert;

/**
 * Zebra crossings from Transport Department
 */
export const zebraCrossings = mysqlTable("zebraCrossings", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  district: varchar("district", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  hasOctopusExtension: boolean("hasOctopusExtension").default(false).notNull(),
  hasAudioSignal: boolean("hasAudioSignal").default(false).notNull(),
  crossingWidth: decimal("crossingWidth", { precision: 5, scale: 2 }), // in meters
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdx: index("location_idx").on(table.latitude, table.longitude),
  octopusIdx: index("octopus_idx").on(table.hasOctopusExtension),
}));

export type ZebraCrossing = typeof zebraCrossings.$inferSelect;
export type InsertZebraCrossing = typeof zebraCrossings.$inferInsert;

/**
 * Pedestrian network nodes from 3D Pedestrian Network
 */
export const pedestrianNodes = mysqlTable("pedestrianNodes", {
  id: int("id").autoincrement().primaryKey(),
  nodeId: varchar("nodeId", { length: 100 }).notNull().unique(),
  name: text("name"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  elevation: decimal("elevation", { precision: 8, scale: 2 }), // in meters
  nodeType: varchar("nodeType", { length: 50 }), // crossing, junction, entrance, etc.
  isAccessible: boolean("isAccessible").default(true).notNull(),
  facilityType: varchar("facilityType", { length: 50 }), // lift, escalator, ramp, stairs, level
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdx: index("location_idx").on(table.latitude, table.longitude),
  accessibleIdx: index("accessible_idx").on(table.isAccessible),
}));

export type PedestrianNode = typeof pedestrianNodes.$inferSelect;
export type InsertPedestrianNode = typeof pedestrianNodes.$inferInsert;

/**
 * Pedestrian network links connecting nodes
 */
export const pedestrianLinks = mysqlTable("pedestrianLinks", {
  id: int("id").autoincrement().primaryKey(),
  linkId: varchar("linkId", { length: 100 }).notNull().unique(),
  fromNodeId: varchar("fromNodeId", { length: 100 }).notNull(),
  toNodeId: varchar("toNodeId", { length: 100 }).notNull(),
  distance: decimal("distance", { precision: 8, scale: 2 }).notNull(), // in meters
  linkType: varchar("linkType", { length: 50 }), // footbridge, subway, street, indoor
  isAccessible: boolean("isAccessible").default(true).notNull(),
  hasStairs: boolean("hasStairs").default(false).notNull(),
  hasRamp: boolean("hasRamp").default(false).notNull(),
  hasLift: boolean("hasLift").default(false).notNull(),
  slope: decimal("slope", { precision: 5, scale: 2 }), // gradient percentage
  surface: varchar("surface", { length: 50 }), // paved, unpaved, etc.
  width: decimal("width", { precision: 5, scale: 2 }), // in meters
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  fromNodeIdx: index("from_node_idx").on(table.fromNodeId),
  toNodeIdx: index("to_node_idx").on(table.toNodeId),
  accessibleIdx: index("accessible_idx").on(table.isAccessible),
}));

export type PedestrianLink = typeof pedestrianLinks.$inferSelect;
export type InsertPedestrianLink = typeof pedestrianLinks.$inferInsert;

/**
 * User saved locations
 */
export const savedLocations = mysqlTable("savedLocations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  category: varchar("category", { length: 50 }), // home, work, favorite, etc.
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertSavedLocation = typeof savedLocations.$inferInsert;

/**
 * User route history
 */
export const routeHistory = mysqlTable("routeHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fromAddress: text("fromAddress").notNull(),
  toAddress: text("toAddress").notNull(),
  fromLatitude: decimal("fromLatitude", { precision: 10, scale: 7 }).notNull(),
  fromLongitude: decimal("fromLongitude", { precision: 10, scale: 7 }).notNull(),
  toLatitude: decimal("toLatitude", { precision: 10, scale: 7 }).notNull(),
  toLongitude: decimal("toLongitude", { precision: 10, scale: 7 }).notNull(),
  distance: decimal("distance", { precision: 8, scale: 2 }), // in meters
  duration: int("duration"), // in seconds
  routeData: text("routeData"), // JSON string of route details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type RouteHistory = typeof routeHistory.$inferSelect;
export type InsertRouteHistory = typeof routeHistory.$inferInsert;
