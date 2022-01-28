import { createAccessToken, createRefreshToken } from '../../utils/token'
import { User } from '@prisma/client'
import { compare } from 'bcrypt'
import { isEmpty } from 'class-validator'
import { stringArg, nonNull, extendType, arg } from 'nexus'
import { Context } from '../../utils/context'

export const LoginMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, { email, password }, context: Context) => {
        if (isEmpty({email,password})) throw new Error("You're not userData");
        const user: User = await context.prisma.user.findUnique({
          where: {
            email,
          },
        });
       if (!user) throw new Error(`You're email ${email} not found`);
        const isPasswordMatching: boolean = await compare(password, user.password);
        if (!isPasswordMatching) throw  new Error("You're password not matching");
        console.log(user)
      const access_token=  await createAccessToken(user);
      const refresh_token = await  createRefreshToken(user);
       context.res.cookie('refresh_token', refresh_token, { maxAge: 60 * 60 * 1000, httpOnly: true, secure: false, sameSite: 'strict' });
        // await context.prisma.user.update({ where: { id: user.id }, data: { refresh_token: refeshtoken, access_token: acccestoken } });
        return {
          user,
          access_token,
          refresh_token,
        }
      },
    })
  },
})

