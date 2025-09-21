// seed.js
// TaxiDrive Association App - Realtime Database Seeder
// Run with: node seed.js

import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import fs from "fs";

// Load service account credentials
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json"));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://taxidrive-337a3-default-rtdb.firebaseio.com", // Replace with your RTDB URL
});

const db = getDatabase();

// --- SEED DATA ---
const seedData = {
  users: {
    user1: {
      email: "association@example.com",
      name: "Johannesburg Taxi Association",
      role: "association",
      createdAt: new Date().toISOString(),
    },
    user2: {
      email: "owner@example.com",
      name: "Thabo Mthembu",
      role: "owner",
      createdAt: new Date().toISOString(),
    },
    user3: {
      email: "driver@example.com",
      name: "Sipho Dlamini",
      role: "driver",
      createdAt: new Date().toISOString(),
    },
    user4: {
      email: "passenger@example.com",
      name: "Nomsa Khumalo",
      role: "passenger",
      createdAt: new Date().toISOString(),
    },
  },
  associations: {
    assoc1: {
      name: "Johannesburg Taxi Association",
      region: "Johannesburg",
      routes: {
        route1: { origin: "Soweto", destination: "Sandton", price: 25 },
        route2: { origin: "Alexandra", destination: "Rosebank", price: 20 },
      },
      createdAt: new Date().toISOString(),
    },
    assoc2: {
      name: "Durban Taxi Association",
      region: "Durban",
      routes: {
        route1: { origin: "Umlazi", destination: "Durban CBD", price: 15 },
        route2: { origin: "KwaMashu", destination: "Umhlanga", price: 30 },
      },
      createdAt: new Date().toISOString(),
    },
  },
  drivers: {
    driver1: {
      name: "Sipho Dlamini",
      license: "KZN12345",
      associationId: "assoc1",
      createdAt: new Date().toISOString(),
    },
    driver2: {
      name: "Zanele Khumalo",
      license: "KZN67890",
      associationId: "assoc2",
      createdAt: new Date().toISOString(),
    },
  },
  owners: {
    owner1: {
      name: "Mr. Dlamini",
      vehicles: ["car1", "car2"],
      createdAt: new Date().toISOString(),
    },
    owner2: {
      name: "Mrs. Ndlovu",
      vehicles: ["car3"],
      createdAt: new Date().toISOString(),
    },
  },
  passengers: {
    passenger1: {
      name: "Thandi",
      phone: "+27 82 123 4567",
      createdAt: new Date().toISOString(),
    },
    passenger2: {
      name: "Andile",
      phone: "+27 73 987 6543",
      createdAt: new Date().toISOString(),
    },
  },
  payments: {
    payment1: {
      userId: "user1",
      amount: 50,
      method: "cash",
      timestamp: new Date().toISOString(),
    },
    payment2: {
      userId: "user2",
      amount: 70,
      method: "card",
      timestamp: new Date().toISOString(),
    },
    payment3: {
      userId: "user1",
      amount: 100,
      method: "mobile",
      timestamp: new Date().toISOString(),
    },
  },
};

// --- SEED FUNCTION ---
async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    for (const [collection, docs] of Object.entries(seedData)) {
      await db.ref(collection).set(docs);
      console.log(`✅ Seeded collection: ${collection}`);
    }

    console.log("🎉 Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
