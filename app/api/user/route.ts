import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { handleAuthOption } from "@/lib/auth";

export const GET  = async() => {
    const session = await getServerSession(handleAuthOption);
    if(session) {
        return NextResponse.json({
           user: session.user.id
        })
    }
    return NextResponse.json({message: "You are not logged iN"}, {status: 403})
}