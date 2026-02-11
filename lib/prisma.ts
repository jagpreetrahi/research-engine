import {PrismaClient} from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import  {Pool} from 'pg';

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool);
const prismaClient = new PrismaClient({
    adapter
})

export const prismaConnection = globalForPrisma.prisma || prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaConnection

