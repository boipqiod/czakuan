import { Injectable, OnModuleInit } from '@nestjs/common';

// Mock PrismaService until we can download the actual client
@Injectable()
export class PrismaService implements OnModuleInit {
  user = {
    create: async (data: any) => ({ id: 1, ...data.data }),
    findMany: async (params?: any) => [],
    findUnique: async (params?: any) => null,
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
  };

  post = {
    findMany: async (params?: any) => [],
    findUnique: async (params?: any) => null,
  };

  categoryGroup = {
    findMany: async (params?: any) => [],
  };

  async onModuleInit() {
    console.log('Mock PrismaService initialized');
  }

  async onModuleDestroy() {
    console.log('Mock PrismaService destroyed');
  }

  async $connect() {
    console.log('Mock PrismaService connected');
  }

  async $disconnect() {
    console.log('Mock PrismaService disconnected');
  }
}