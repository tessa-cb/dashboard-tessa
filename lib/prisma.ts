import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  // Prisma v6: connection is configured via schema.prisma datasource url (DATABASE_URL)
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
