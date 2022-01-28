
import { verifyResetPassToken } from '../../utils/token';
import { User } from '@prisma/client';
import { ApolloError } from 'apollo-server-core';
import { hash } from 'bcrypt';
import { stringArg, nonNull, extendType, arg } from 'nexus';
import { Context } from '../../utils/context';

export const ResetpassMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('Resetpass', {
      type: 'ResetpassPayload',
      args: {
        userId: nonNull(stringArg()),
        token: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId: string = args.userId;
        const resetPassToken: string = args.token;
        const password: string = args.password;

        const findUser: User = await context.prisma.user.findUnique({ where: { id: userId } });
        if (!findUser) throw new ApolloError(`User with ${userId} not found`);

        const UserID = await verifyResetPassToken(findUser, resetPassToken);

        const hashedPassword = await hash(args.password, 10);
        const updateUserData = await context.prisma.user.update({ where: { id: UserID }, data: { ...findUser, password: hashedPassword } });

        return {
          // token: sign({ userId: user.id }, APP_SECRET),
        };
      },
    });
  },
});
