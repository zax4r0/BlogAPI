import { extendType } from 'nexus'
import { Context } from '../../utils/context'
import { getUserId } from '../../utils/getUserById'

export const MeQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nullable.field('me', {
      type: 'User',
      resolve: async (_parent, _args, context: Context) => {
        const user = await getUserId(context)
        console.log(user.id)
        return context.prisma.user.findUnique({
          where: {
            id: String(user.id),
          },
        })
      },
    })
  },
})
