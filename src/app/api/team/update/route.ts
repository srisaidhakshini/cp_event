import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { email, codeforcesHandle } = await req.json();

        if (!email || !codeforcesHandle) {
            return NextResponse.json(
                { message: "Email and Codeforces handle are required" },
                { status: 400 }
            );
        }

        const team = await Team.findOne({ email });

        if (!team) {
            return NextResponse.json(
                { message: "Team not found" },
                { status: 404 }
            );
        }

        // Allow update only once
        if (team.codeforcesHandle) {
            return NextResponse.json(
                { message: "Codeforces handle already set" },
                { status: 400 }
            );
        }

        team.codeforcesHandle = codeforcesHandle;
        await team.save();

        return NextResponse.json({
            message: "Codeforces handle updated successfully",
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
