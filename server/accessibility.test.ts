import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    fontSize: "large",
    highContrast: true,
    voiceNavigation: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Accessibility Data Queries", () => {
  it("should retrieve all lifts", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const lifts = await caller.accessibility.getLifts();

    expect(Array.isArray(lifts)).toBe(true);
    expect(lifts.length).toBeGreaterThan(0);
    
    // Verify lift data structure
    const firstLift = lifts[0];
    expect(firstLift).toHaveProperty("liftNumber");
    expect(firstLift).toHaveProperty("location");
    expect(firstLift).toHaveProperty("isAccessible");
    expect(firstLift).toHaveProperty("isOperational");
  });

  it("should retrieve accessible footbridges only", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const footbridges = await caller.accessibility.getAccessibleFootbridges();

    expect(Array.isArray(footbridges)).toBe(true);
    
    // All returned footbridges should be accessible
    footbridges.forEach(bridge => {
      expect(bridge.isAccessible).toBe(true);
    });
  });

  it("should retrieve zebra crossings with octopus extension", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const crossings = await caller.accessibility.getZebraCrossingsWithOctopus();

    expect(Array.isArray(crossings)).toBe(true);
    
    // All returned crossings should have octopus extension
    crossings.forEach(crossing => {
      expect(crossing.hasOctopusExtension).toBe(true);
    });
  });

  it("should retrieve accessible pedestrian nodes", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const nodes = await caller.accessibility.getAccessibleNodes();

    expect(Array.isArray(nodes)).toBe(true);
    
    // All returned nodes should be accessible
    nodes.forEach(node => {
      expect(node.isAccessible).toBe(true);
    });
  });

  it("should retrieve accessible pedestrian links without stairs", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const links = await caller.accessibility.getAccessibleLinks();

    expect(Array.isArray(links)).toBe(true);
    
    // All returned links should be accessible and have no stairs
    links.forEach(link => {
      expect(link.isAccessible).toBe(true);
      expect(link.hasStairs).toBe(false);
    });
  });
});

describe("User Preferences", () => {
  it("should update user accessibility preferences", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.updatePreferences({
      fontSize: "extra-large",
      highContrast: true,
      voiceNavigation: true,
    });

    expect(result.success).toBe(true);
  });
});

describe("Saved Locations", () => {
  it("should retrieve user saved locations", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const locations = await caller.savedLocations.list();

    expect(Array.isArray(locations)).toBe(true);
  });

  it("should add a saved location", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.savedLocations.add({
      name: "Test Location",
      address: "123 Test Street",
      latitude: "22.3193",
      longitude: "114.1694",
      category: "favorite",
      notes: "Test notes",
    });

    expect(result.success).toBe(true);
  });
});

describe("Route History", () => {
  it("should retrieve user route history", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.routeHistory.list({ limit: 10 });

    expect(Array.isArray(history)).toBe(true);
  });

  it("should add route to history", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.routeHistory.add({
      fromAddress: "Central MTR",
      toAddress: "Causeway Bay MTR",
      fromLatitude: "22.2817",
      fromLongitude: "114.1553",
      toLatitude: "22.2799",
      toLongitude: "114.1849",
      distance: "2.5",
      duration: 1800,
      routeData: JSON.stringify({ steps: [] }),
    });

    expect(result.success).toBe(true);
  });
});
