import { eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  lifts, 
  footbridges, 
  zebraCrossings, 
  pedestrianNodes, 
  pedestrianLinks,
  savedLocations,
  routeHistory,
  type Lift,
  type Footbridge,
  type ZebraCrossing,
  type PedestrianNode,
  type PedestrianLink,
  type SavedLocation,
  type RouteHistory
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPreferences(userId: number, preferences: {
  fontSize?: "normal" | "large" | "extra-large";
  highContrast?: boolean;
  voiceNavigation?: boolean;
}) {
  const db = await getDb();
  if (!db) return;

  await db.update(users)
    .set(preferences)
    .where(eq(users.id, userId));
}

// Accessibility data queries

export async function getAllLifts(): Promise<Lift[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(lifts).where(eq(lifts.isOperational, true));
}

export async function getLiftsNearLocation(lat: number, lng: number, radiusKm: number = 1): Promise<Lift[]> {
  const db = await getDb();
  if (!db) return [];

  // Haversine formula for distance calculation
  const result = await db.select().from(lifts)
    .where(
      and(
        eq(lifts.isOperational, true),
        eq(lifts.isAccessible, true)
      )
    );

  // Filter by distance in JavaScript (more accurate than SQL approximation)
  return result.filter(lift => {
    if (!lift.latitude || !lift.longitude) return false;
    const distance = calculateDistance(
      lat, lng,
      parseFloat(lift.latitude), parseFloat(lift.longitude)
    );
    return distance <= radiusKm;
  });
}

export async function getAllFootbridges(): Promise<Footbridge[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(footbridges);
}

export async function getAccessibleFootbridges(): Promise<Footbridge[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(footbridges).where(eq(footbridges.isAccessible, true));
}

export async function getAllZebraCrossings(): Promise<ZebraCrossing[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(zebraCrossings);
}

export async function getZebraCrossingsWithOctopus(): Promise<ZebraCrossing[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(zebraCrossings).where(eq(zebraCrossings.hasOctopusExtension, true));
}

export async function getPedestrianNodes(): Promise<PedestrianNode[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pedestrianNodes);
}

export async function getAccessiblePedestrianNodes(): Promise<PedestrianNode[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pedestrianNodes).where(eq(pedestrianNodes.isAccessible, true));
}

export async function getPedestrianLinks(): Promise<PedestrianLink[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pedestrianLinks);
}

export async function getAccessiblePedestrianLinks(): Promise<PedestrianLink[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pedestrianLinks)
    .where(
      and(
        eq(pedestrianLinks.isAccessible, true),
        eq(pedestrianLinks.hasStairs, false)
      )
    );
}

// User saved locations

export async function getUserSavedLocations(userId: number): Promise<SavedLocation[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(savedLocations).where(eq(savedLocations.userId, userId));
}

export async function addSavedLocation(location: typeof savedLocations.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  await db.insert(savedLocations).values(location);
}

export async function deleteSavedLocation(locationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(savedLocations)
    .where(
      and(
        eq(savedLocations.id, locationId),
        eq(savedLocations.userId, userId)
      )
    );
}

// Route history

export async function getUserRouteHistory(userId: number, limit: number = 10): Promise<RouteHistory[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(routeHistory)
    .where(eq(routeHistory.userId, userId))
    .orderBy(sql`${routeHistory.createdAt} DESC`)
    .limit(limit);
}

export async function addRouteHistory(route: typeof routeHistory.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  await db.insert(routeHistory).values(route);
}

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
