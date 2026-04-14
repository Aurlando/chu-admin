const { PrismaClient } = require('../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
    // Décommenter pour voir le SQL généré en terminal (debug) :
    // log: ['query', 'error', 'warn'],
});

module.exports = prisma;