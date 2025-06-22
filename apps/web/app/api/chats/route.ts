import dbClient from "@repo/db-config/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const { roomId } = await req.json();
    try {
        const chats = await dbClient.chats.findMany({
            where: { roomId },
            select: { username: true, text: true, roomId: true }
        });
        return NextResponse.json({ chats }, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}