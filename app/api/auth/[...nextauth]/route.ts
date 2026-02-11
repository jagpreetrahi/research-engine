import { handleAuthOption } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(handleAuthOption);

export { handler as GET, handler as POST}