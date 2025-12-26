// ===========================================
// TEAM SEEDING SCRIPT
// Run with: npx tsx scripts/seed-teams.ts
// ===========================================

import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Team from '../src/models/Team';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI as string;

// Sample teams for onboarding
const sampleTeams = [
  {
    teamName: "Team Alpha",
    email: "alpha@example.com",
    codeforcesHandle: "gowreesh",
  },
  {
    teamName: "Team Beta",
    email: "beta@example.com",
    codeforcesHandle: "Geothermal",
  },
  {
    teamName: "Team Gamma",
    email: "gamma@example.com",
    codeforcesHandle: "gowreesh43",
  },
  {
    teamName: "Solo Player",
    email: "solo@example.com",
    codeforcesHandle: "iammanay",
  },
];

async function seedTeams() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Team.deleteMany({});
    console.log('Cleared existing teams');

    const teams = await Team.insertMany(sampleTeams);
    console.log(`\nInserted ${teams.length} teams\n`);

    console.log('Teams created:');
    teams.forEach(team => {
      console.log(`  - ${team.teamName}`);
      console.log(`    ID: ${team._id}`);
      console.log(`    Email: ${team.email}`);
      console.log(`    Codeforces Handle: ${team.codeforcesHandle || 'Not set'}`);
    });

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedTeams();
