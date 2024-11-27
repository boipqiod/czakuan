import {Role} from '@prisma/client';

export type Author = {
  id: number;
  role: Role;
  nickName: string;
  profileImageUrl: string | null;
};
