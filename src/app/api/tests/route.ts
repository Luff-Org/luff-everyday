import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wpm, rawWpm, accuracy, duration } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await prisma.testResult.create({
      data: {
        wpm,
        rawWpm,
        accuracy,
        duration,
        userId: user.id
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to save test", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
