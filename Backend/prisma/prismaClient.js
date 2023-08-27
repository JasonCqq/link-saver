const { PrismaClient } = require("@prisma/client");

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

module.exports = global.prisma;
