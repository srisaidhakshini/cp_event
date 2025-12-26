import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const { codeforcesHandle } = await req.json();

        if (!codeforcesHandle) {
            return NextResponse.json(
                { message: "Codeforces handle is required" },
                { status: 400 }
            );
        }

        // Validate Codeforces handle format
        const handleRegex = /^[a-zA-Z0-9_-]{3,24}$/;
        if (!handleRegex.test(codeforcesHandle)) {
            return NextResponse.json(
                { message: "Invalid Codeforces handle format. Use 3-24 alphanumeric characters, underscores, or hyphens." },
                { status: 400 }
            );
        }

        const team = await Team.findOne({ email: session.user.email });

        if (!team) {
            return NextResponse.json(
                { message: "Team not found" },
                { status: 404 }
            );
        }
        
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
