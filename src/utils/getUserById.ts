
import { User } from '@prisma/client';
import { AuthenticationError } from 'apollo-server-errors'
import config from 'config';
import { verify } from 'jsonwebtoken';
import { Context } from './context'
import prisma from './prisma';
import { verifyAccesToken } from './token';

export async function getUserId(context: Context)  {
  const authHeader = context.req.headers['authorization'];
  const bearerToken = authHeader.split(' ');
  const access_token = bearerToken[1];
  const auth = await verifyAccesToken(access_token);
  console.log(auth)
  context.req.user = auth

if (context.req.user.id) {
  return auth
}

throw new AuthenticationError('Not Authorized');
}




