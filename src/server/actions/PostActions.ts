'use server';

import prisma from '@/server/modules/prisma';

export const getData = async () => {
  return prisma.category.findMany();
};
