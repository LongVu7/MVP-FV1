const { PrismaClient } = require('@prisma/client');

// Initialize the global Prisma Client using the native Rust engine
const prisma = new PrismaClient();

module.exports = prisma;