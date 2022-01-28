
import { sendMail } from '../../utils/sendMail'
import { User } from '@prisma/client'
import { ApolloError } from 'apollo-server-core'
import { hash } from 'bcrypt'
import { stringArg, nonNull, extendType, arg } from 'nexus'
import { Context } from '../../utils/context'

export const SignupMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'Registerpayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        firstName:nonNull(stringArg()),
        lastName:nonNull(stringArg()),
        username:nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const findUser: User = await context.prisma.user.findUnique({ where: { email: args.email } });
        if (findUser) throw new ApolloError(`You're email ${args.email} already exists`);
        const hashedPassword = await hash(args.password, 10)
        const user = await context.prisma.user.create({
          data: {
            lastName:args.lastName,
            firstName: args.firstName,
            username:args.username,
            email: args.email,
            password: hashedPassword,
          },
        });
        try {
          sendMail({
            to: user.email,
            from: 'hmmm',
            subject: 'Account Created',
            template: 'welcome',
            templateVars: {
              email: user.email,
              name: user.name,
              username: user.username,
              // resetLink: 'http://localhost:5000',
            },
          });
        } catch (error) {
         throw new ApolloError(error)
        }
        return {
          // token: sign({ userId: user.id }, APP_SECRET),
          email:user.email,
          firstName:user.firstName,
          lastName:user.lastName,
          username:user.username,
        }
      },
    })
  },
})
