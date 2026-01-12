import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updatePreferences: protectedProcedure
      .input(z.object({
        fontSize: z.enum(["normal", "large", "extra-large"]).optional(),
        highContrast: z.boolean().optional(),
        voiceNavigation: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPreferences(ctx.user.id, input);
        return { success: true };
      }),
  }),

  accessibility: router({
    // Get all lifts
    getLifts: publicProcedure.query(async () => {
      return await db.getAllLifts();
    }),

    // Get lifts near a location
    getLiftsNearby: publicProcedure
      .input(z.object({
        lat: z.number(),
        lng: z.number(),
        radiusKm: z.number().default(1),
      }))
      .query(async ({ input }) => {
        return await db.getLiftsNearLocation(input.lat, input.lng, input.radiusKm);
      }),

    // Get all footbridges
    getFootbridges: publicProcedure.query(async () => {
      return await db.getAllFootbridges();
    }),

    // Get accessible footbridges only
    getAccessibleFootbridges: publicProcedure.query(async () => {
      return await db.getAccessibleFootbridges();
    }),

    // Get all zebra crossings
    getZebraCrossings: publicProcedure.query(async () => {
      return await db.getAllZebraCrossings();
    }),

    // Get zebra crossings with octopus extension
    getZebraCrossingsWithOctopus: publicProcedure.query(async () => {
      return await db.getZebraCrossingsWithOctopus();
    }),

    // Get pedestrian network nodes
    getPedestrianNodes: publicProcedure.query(async () => {
      return await db.getPedestrianNodes();
    }),

    // Get accessible pedestrian nodes
    getAccessibleNodes: publicProcedure.query(async () => {
      return await db.getAccessiblePedestrianNodes();
    }),

    // Get pedestrian network links
    getPedestrianLinks: publicProcedure.query(async () => {
      return await db.getPedestrianLinks();
    }),

    // Get accessible pedestrian links (no stairs)
    getAccessibleLinks: publicProcedure.query(async () => {
      return await db.getAccessiblePedestrianLinks();
    }),
  }),

  savedLocations: router({
    // Get user's saved locations
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSavedLocations(ctx.user.id);
    }),

    // Add a saved location
    add: protectedProcedure
      .input(z.object({
        name: z.string(),
        address: z.string().optional(),
        latitude: z.string(),
        longitude: z.string(),
        category: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addSavedLocation({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    // Delete a saved location
    delete: protectedProcedure
      .input(z.object({
        locationId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteSavedLocation(input.locationId, ctx.user.id);
        return { success: true };
      }),
  }),

  liftStatus: router({
    // Get latest status for a specific lift
    getStatus: publicProcedure
      .input(z.object({
        liftId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getLatestLiftStatus(input.liftId);
      }),

    // Get all lift statuses
    getAllStatuses: publicProcedure.query(async () => {
      const statusMap = await db.getAllLiftStatuses();
      return Object.fromEntries(statusMap);
    }),

    // Get out-of-service lifts
    getOutOfService: publicProcedure.query(async () => {
      return await db.getOutOfServiceLifts();
    }),

    // Report lift status (user or system)
    report: protectedProcedure
      .input(z.object({
        liftId: z.number(),
        status: z.enum(["operational", "out_of_service", "under_maintenance", "unknown"]),
        notes: z.string().optional(),
        estimatedFixDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.reportLiftStatus({
          ...input,
          reportedBy: `user:${ctx.user.id}`,
          isVerified: ctx.user.role === "admin",
        });
        return { success: true };
      }),
  }),

  accessibilityNotes: router({
    // Get notes near a location
    getNearby: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(1),
      }))
      .query(async ({ input }) => {
        return await db.getAccessibilityNotes(input.latitude, input.longitude, input.radiusKm);
      }),

    // Get notes for a specific facility
    getByFacility: publicProcedure
      .input(z.object({
        facilityType: z.string(),
        facilityId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getNotesByFacility(input.facilityType, input.facilityId);
      }),

    // Add a new accessibility note
    add: protectedProcedure
      .input(z.object({
        facilityType: z.enum(["lift", "footbridge", "zebra_crossing", "mtr_station", "bus_stop", "general"]),
        facilityId: z.number().optional(),
        locationName: z.string(),
        latitude: z.string(),
        longitude: z.string(),
        rating: z.number().min(1).max(5),
        condition: z.enum(["excellent", "good", "fair", "poor", "inaccessible"]),
        comment: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const noteId = await db.addAccessibilityNote({
          ...input,
          userId: ctx.user.id,
          isVerified: ctx.user.role === "admin",
        });
        return { success: true, noteId };
      }),

    // Add photo to a note
    addPhoto: protectedProcedure
      .input(z.object({
        noteId: z.number(),
        photoUrl: z.string(),
        photoKey: z.string(),
        caption: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addNotePhoto({
          ...input,
          uploadedBy: ctx.user.id,
        });
        return { success: true };
      }),

    // Get photos for a note
    getPhotos: publicProcedure
      .input(z.object({
        noteId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getNotePhotos(input.noteId);
      }),

    // Get user's own notes
    getUserNotes: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserNotes(ctx.user.id);
    }),
  }),

  destinations: router({
    // Get all destinations
    getAll: publicProcedure.query(async () => {
      return await db.getAllPopularDestinations();
    }),

    // Get destinations by category
    getByCategory: publicProcedure
      .input(z.object({
        category: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getPopularDestinationsByCategory(input.category);
      }),
  }),

  routeHistory: router({
    // Get user's route history
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(10),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserRouteHistory(ctx.user.id, input.limit);
      }),

    // Add route to history
    add: protectedProcedure
      .input(z.object({
        fromAddress: z.string(),
        toAddress: z.string(),
        fromLatitude: z.string(),
        fromLongitude: z.string(),
        toLatitude: z.string(),
        toLongitude: z.string(),
        distance: z.string().optional(),
        duration: z.number().optional(),
        routeData: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addRouteHistory({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
