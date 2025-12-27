import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

export async function POST() {
  try {
    await connectDB();

    const team = {
      teamName: "Manmay",
      email: "imanmay2@gmail.com",
      codeforcesHandle: null,
    };


    const result = await Team.updateOne(
      { email: team.email },
      { $setOnInsert: team },
      { upsert: true }
    );

    if (result.upsertedCount === 1) {
      return NextResponse.json({
        message: "Team inserted successfully",
        team,
      });
    }

    return NextResponse.json({
      message: "Team already exists in DB",
      team,
    });

  } catch (error: any) {
    console.error("SEED ERROR:", error.message);

    return NextResponse.json(
      {
        message: "Seeding failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
