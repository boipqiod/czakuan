import {PrismaClient} from '@prisma/client';

class Prisma extends PrismaClient {
  constructor() {
    super();
  }

  async connect() {
    await this.$connect();
  }

  async disconnect() {
    await this.$disconnect();
  }
}

export default new Prisma();
