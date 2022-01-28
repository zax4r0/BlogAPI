import { HttpException } from "../exceptions/HttpException"
import {  User } from "@prisma/client";
import config from "config";
import { sign, verify } from "jsonwebtoken";
import prisma from "./prisma";


export interface DataStoredInToken {
  id: string;
  role?: string;
}

export const   createAccessToken=async(user: User): Promise<string> => {
    // console.log(`Creating acess token `);

    const dataStoredInToken: DataStoredInToken = { id: user.id,};
    const secretKey: string = config.get('secretKey');

    const options = {
      expiresIn: '10m',
      audience: `${user.id}`,
    };

    const token = sign(dataStoredInToken, secretKey, options);
await prisma.user.update({ where: { id: user.id }, data: {  access_token: token } });
    return `${token}`;
  }

export const verifyAccesToken = async (access_token: string): Promise<User> =>
  new Promise((resolve, reject) => {
    const secretKey: string = config.get('secretKey');

    verify(access_token, secretKey, async (err, payload: any) => {
      if (err) return reject(new Error('Unauthorized'+err));

      const userId: string = payload.id;
      // console.log(`Varifing Refresh token ${userId}`);

      if (!userId) {
        throw new Error('Unauthorized');
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        reject(new Error('Unauthorized'));
      }

      if (access_token === user?.access_token) return resolve(user);

      reject(new Error('Unauthorized'));
    });
  });

export const createRefreshToken = async (user: User): Promise<string> => {
  // console.log(`Creating Refresh token `);

  const dataStoredInToken: DataStoredInToken = { id: user.id };
  const secretKey: string = config.get('secretKey');

  const options = {
    expiresIn: '7d',
    audience: `${user.id}`,
  };

  const token = sign(dataStoredInToken, secretKey, options);
  // console.log('======= token callinnnn ============' + user.id)
await prisma.user.update({ where: { id: user.id }, data: {  refresh_token: token } });

  return `${token}`;
};


export const  verifyRefreshToken = async (refresh_token: string): Promise<User> =>

    new Promise((resolve, reject) => {
      const secretKey: string = config.get('secretKey');

      verify(refresh_token, secretKey, async (err, payload: any) => {
        if (err) return reject(new Error('Unauthorized'));

        const userId: string = payload.id;
        // console.log(`Varifing Refresh token ${userId}`);

        if (!userId) {
         throw new Error('Unauthorized');
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
          reject(new Error('Unauthorized'));
        }

        if (refresh_token === user?.refresh_token) return resolve(user);

        reject(new Error('Unauthorized'));
      });
    });

export const createResetPassToken = async (oldPass: string, userId: string): Promise<string> => {
  // console.log(`Creating acess token `);

  const dataStoredInToken: DataStoredInToken = { id: userId };
  const superSec: string = config.get('secretKey');
  const secretKey = superSec + oldPass;

  const options = {
    expiresIn: '15m',
  };

  const token = sign(dataStoredInToken, secretKey, options);
  return `${token}`;
};

export const verifyResetPassToken =  async (user: User, resetPassToken): Promise<string> =>
  new Promise((resolve, reject) => {
    const superSec: string = config.get('secretKey');
    const secretKey = superSec + user.password;

    verify(resetPassToken, secretKey, async (err, payload: any) => {
      if (err) return reject(new Error('Some Error'));

      const userId: string = payload.id;

      if (!userId) {
        throw new Error('Not Found');
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        reject(new Error('Not Found'));
      }
      return resolve(userId);
    });
  });

export const sendrefreshToken = async (refresh_token: string): Promise<{ acessToken: string; refreshToken: string }> => {
    // console.log(refresh_token);
    const user = await verifyRefreshToken(refresh_token);

    const newAccessToken = await createAccessToken(user);
    const newRefreshToken = await createRefreshToken(user);

    await prisma.user.update({ where: { id: user.id }, data: { refresh_token: newRefreshToken, access_token: newAccessToken } });

    return { acessToken: newAccessToken, refreshToken: newRefreshToken };
  }