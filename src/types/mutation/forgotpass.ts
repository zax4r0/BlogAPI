import { sendMail } from '../../utils/sendMail';
import { createResetPassToken } from '../../utils/token';
import { User } from '@prisma/client';
import { ApolloError } from 'apollo-server-core';
import { hash } from 'bcrypt';
import { stringArg, nonNull, extendType, arg } from 'nexus';
import { Context } from '../../utils/context';

export const ForgotPasswordMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('forgotpassword', {
      type: 'Registerpayload',
      args: {
        email: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const findUser: User = await context.prisma.user.findUnique({ where: { email: args.email } });
        if (!findUser) throw new ApolloError(`Please check ur email  ${args.email}`);
        const token = await createResetPassToken(findUser.password, findUser.id);
        try {
          sendMail({
            to: findUser.email,
            from: 'support@mayaenterprises.co.in',
            subject: 'Reset Your Password',
            template: 'password-reset',
            templateVars: {
              email: findUser.email,
              name: findUser.firstName,
              username: findUser.username,
              resetLink: `http://localhost:3000/users/reset-password-now/${findUser.id}/${token}`,
            },
          });
        } catch (error) {
         throw new ApolloError(error);
        }
        return {
          // token: sign({ userId: user.id }, APP_SECRET),
          email:findUser.email
        };
      },
    });
  },
});
