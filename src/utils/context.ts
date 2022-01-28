import { PrismaClient } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

export interface AUser {
  user: { [key: string]: any };
  userId: any;
  views: any;
}


export type Context = {
  prisma: PrismaClient;
  req: Request & AUser
  res: Response;
  next: NextFunction;
  // HTTP request carrying the `Authorization` header
};
