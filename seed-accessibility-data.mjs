import { drizzle } from "drizzle-orm/mysql2";
import "dotenv/config";
import { lifts, footbridges, zebraCrossings, pedestrianNodes, pedestrianLinks } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// Sample lift data based on Hong Kong locations
const sampleLifts = [
  {
    liftNumber: "HF001-L1",
    location: "Central-Mid-Levels Escalator",
    address: "Queen's Road Central, Central",
    district: "Central and Western",
    latitude: "22.2817",
    longitude: "114.1553",
    type: "passenger",
    isAccessible: true,
    isOperational: true,
    notes: "Part of Central-Mid-Levels escalator system"
  },
  {
    liftNumber: "HF118-L1",
    location: "Causeway Bay Footbridge",
    address: "Yee Wo Street, Causeway Bay",
    district: "Wan Chai",
    latitude: "22.2799",
    longitude: "114.1849",
    type: "passenger",
    isAccessible: true,
    isOperational: true,
    notes: "Connects to Times Square"
  },
  {
    liftNumber: "MTR-TST-L1",
    location: "Tsim Sha Tsui MTR Station Exit B",
    address: "Nathan Road, Tsim Sha Tsui",
    district: "Yau Tsim Mong",
    latitude: "22.2976",
    longitude: "114.1722",
    type: "passenger",
    isAccessible: true,
    isOperational: true,
    notes: "MTR station accessible lift"
  },
  {
    liftNumber: "HF205-L1",
    location: "Mong Kok Footbridge Network",
    address: "Argyle Street, Mong Kok",
    district: "Yau Tsim Mong",
    latitude: "22.3193",
    longitude: "114.1694",
    type: "passenger",
    isAccessible: true,
    isOperational: true,
    notes: "Connects to Langham Place"
  },
  {
    liftNumber: "HF312-L1",
    location: "Admiralty Footbridge",
    address: "Queensway, Admiralty",
    district: "Central and Western",
    latitude: "22.2783",
    longitude: "114.1650",
    type: "passenger",
    isAccessible: true,
    isOperational: true,
    notes: "Near Pacific Place"
  }
];

// Sample footbridge data
const sampleFootbridges = [
  {
    bridgeNumber: "HF001",
    name: "Central Footbridge System",
    location: "Central, Hong Kong Island",
    district: "Central and Western",
    latitude: "22.2817",
    longitude: "114.1553",
    hasLift: true,
    hasEscalator: true,
    hasRamp: false,
    isAccessible: true,
    notes: "Extensive footbridge network in Central business district"
  },
  {
    bridgeNumber: "HF118",
    name: "Causeway Bay Footbridge",
    location: "Causeway Bay, Hong Kong Island",
    district: "Wan Chai",
    latitude: "22.2799",
    longitude: "114.1849",
    hasLift: true,
    hasEscalator: true,
    hasRamp: false,
    isAccessible: true,
    notes: "Connects major shopping areas"
  },
  {
    bridgeNumber: "HF205",
    name: "Mong Kok Footbridge Network",
    location: "Mong Kok, Kowloon",
    district: "Yau Tsim Mong",
    latitude: "22.3193",
    longitude: "114.1694",
    hasLift: true,
    hasEscalator: true,
    hasRamp: false,
    isAccessible: true,
    notes: "Busy pedestrian network"
  },
  {
    bridgeNumber: "HF312",
    name: "Admiralty Footbridge",
    location: "Admiralty, Hong Kong Island",
    district: "Central and Western",
    latitude: "22.2783",
    longitude: "114.1650",
    hasLift: true,
    hasEscalator: true,
    hasRamp: true,
    isAccessible: true,
    notes: "Connects government offices and shopping centers"
  },
  {
    bridgeNumber: "HF089",
    name: "Wan Chai Footbridge",
    location: "Wan Chai, Hong Kong Island",
    district: "Wan Chai",
    latitude: "22.2770",
    longitude: "114.1722",
    hasLift: false,
    hasEscalator: false,
    hasRamp: false,
    isAccessible: false,
    notes: "Stairs only - not accessible"
  }
];

// Sample zebra crossing data
const sampleZebraCrossings = [
  {
    name: "Nathan Road / Argyle Street",
    location: "Mong Kok, Kowloon",
    district: "Yau Tsim Mong",
    latitude: "22.3193",
    longitude: "114.1694",
    hasOctopusExtension: true,
    hasAudioSignal: true,
    crossingWidth: "12.5",
    notes: "High pedestrian traffic area with extended crossing time"
  },
  {
    name: "Hennessy Road / Percival Street",
    location: "Causeway Bay, Hong Kong Island",
    district: "Wan Chai",
    latitude: "22.2799",
    longitude: "114.1849",
    hasOctopusExtension: true,
    hasAudioSignal: true,
    crossingWidth: "15.0",
    notes: "Major shopping district crossing"
  },
  {
    name: "Des Voeux Road / Pedder Street",
    location: "Central, Hong Kong Island",
    district: "Central and Western",
    latitude: "22.2817",
    longitude: "114.1553",
    hasOctopusExtension: true,
    hasAudioSignal: true,
    crossingWidth: "10.0",
    notes: "Central business district crossing"
  },
  {
    name: "Queensway / Admiralty",
    location: "Admiralty, Hong Kong Island",
    district: "Central and Western",
    latitude: "22.2783",
    longitude: "114.1650",
    hasOctopusExtension: true,
    hasAudioSignal: true,
    crossingWidth: "14.0",
    notes: "Near government offices"
  },
  {
    name: "Canton Road / Haiphong Road",
    location: "Tsim Sha Tsui, Kowloon",
    district: "Yau Tsim Mong",
    latitude: "22.2976",
    longitude: "114.1722",
    hasOctopusExtension: false,
    hasAudioSignal: true,
    crossingWidth: "11.0",
    notes: "Tourist area crossing"
  }
];

// Sample pedestrian nodes
const sampleNodes = [
  {
    nodeId: "NODE-001",
    name: "Central MTR Exit A",
    latitude: "22.2817",
    longitude: "114.1553",
    elevation: "5.0",
    nodeType: "entrance",
    isAccessible: true,
    facilityType: "lift"
  },
  {
    nodeId: "NODE-002",
    name: "Causeway Bay MTR Exit E",
    latitude: "22.2799",
    longitude: "114.1849",
    elevation: "4.5",
    nodeType: "entrance",
    isAccessible: true,
    facilityType: "lift"
  },
  {
    nodeId: "NODE-003",
    name: "Tsim Sha Tsui MTR Exit B",
    latitude: "22.2976",
    longitude: "114.1722",
    elevation: "3.0",
    nodeType: "entrance",
    isAccessible: true,
    facilityType: "lift"
  },
  {
    nodeId: "NODE-004",
    name: "Mong Kok Junction",
    latitude: "22.3193",
    longitude: "114.1694",
    elevation: "10.0",
    nodeType: "junction",
    isAccessible: true,
    facilityType: "level"
  },
  {
    nodeId: "NODE-005",
    name: "Admiralty Footbridge Access",
    latitude: "22.2783",
    longitude: "114.1650",
    elevation: "8.0",
    nodeType: "junction",
    isAccessible: true,
    facilityType: "lift"
  }
];

// Sample pedestrian links
const sampleLinks = [
  {
    linkId: "LINK-001",
    fromNodeId: "NODE-001",
    toNodeId: "NODE-005",
    distance: "850.0",
    linkType: "footbridge",
    isAccessible: true,
    hasStairs: false,
    hasRamp: false,
    hasLift: true,
    slope: "0.0",
    surface: "paved",
    width: "3.5"
  },
  {
    linkId: "LINK-002",
    fromNodeId: "NODE-002",
    toNodeId: "NODE-004",
    distance: "3200.0",
    linkType: "street",
    isAccessible: true,
    hasStairs: false,
    hasRamp: false,
    hasLift: false,
    slope: "2.5",
    surface: "paved",
    width: "4.0"
  },
  {
    linkId: "LINK-003",
    fromNodeId: "NODE-003",
    toNodeId: "NODE-004",
    distance: "1800.0",
    linkType: "street",
    isAccessible: true,
    hasStairs: false,
    hasRamp: false,
    hasLift: false,
    slope: "1.5",
    surface: "paved",
    width: "5.0"
  },
  {
    linkId: "LINK-004",
    fromNodeId: "NODE-005",
    toNodeId: "NODE-002",
    distance: "2100.0",
    linkType: "footbridge",
    isAccessible: true,
    hasStairs: false,
    hasRamp: true,
    hasLift: true,
    slope: "0.5",
    surface: "paved",
    width: "3.0"
  }
];

async function seedData() {
  console.log("Starting to seed accessibility data...");

  try {
    // Insert lifts
    console.log("Inserting lifts...");
    await db.insert(lifts).values(sampleLifts);
    console.log(`✓ Inserted ${sampleLifts.length} lifts`);

    // Insert footbridges
    console.log("Inserting footbridges...");
    await db.insert(footbridges).values(sampleFootbridges);
    console.log(`✓ Inserted ${sampleFootbridges.length} footbridges`);

    // Insert zebra crossings
    console.log("Inserting zebra crossings...");
    await db.insert(zebraCrossings).values(sampleZebraCrossings);
    console.log(`✓ Inserted ${sampleZebraCrossings.length} zebra crossings`);

    // Insert pedestrian nodes
    console.log("Inserting pedestrian nodes...");
    await db.insert(pedestrianNodes).values(sampleNodes);
    console.log(`✓ Inserted ${sampleNodes.length} pedestrian nodes`);

    // Insert pedestrian links
    console.log("Inserting pedestrian links...");
    await db.insert(pedestrianLinks).values(sampleLinks);
    console.log(`✓ Inserted ${sampleLinks.length} pedestrian links`);

    console.log("\n✅ All accessibility data seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
