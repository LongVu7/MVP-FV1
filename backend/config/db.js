const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

//Create the Prisma adapter wrapped around pg pool
const adapter = new PrismaPg(pool);

//Initialize the global Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

module.exports = prisma;