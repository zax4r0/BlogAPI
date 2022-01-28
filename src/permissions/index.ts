import { rule, shield, } from 'graphql-shield'
import { getUserId } from '../utils/getUserById'
import { Context } from '../utils/context'
import { ApolloError } from 'apollo-server-core';

const rules = {
  isAuthenticatedUser: rule()(async (_parent, _args, context: Context) => {
    const user = await getUserId(context);
    return Boolean(user.id);
  }),
  isDis: rule()(async (_parent, args, context: Context) => {
    const user = getUserId(context);
    const dis = await context.prisma.user.findUnique({
      where: {
        id: String(args.id),
      },
    });
    return (await user).role === dis.role;
  }),
  isAdmin: rule()(async (_parent, args, context: Context) => {
    const user = getUserId(context);
    const adm = await context.prisma.user.findUnique({
      where: {
        id: String(args.id),
      },
    });
    return (await user).role === adm.role;
  }),
  // isPostOwner: rule()(async (_parent, args, context) => {
  //   const userId = getUserId(context)
  //   const author = await context.prisma.posts
  //     .findUnique({
  //       where: {
  //         id: String(args.id),
  //       },
  //     })
  //     .author()
  //   return userId === author.id
  // }),
};

export const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser
    // posts: rules.isAuthenticatedUser,

  },
  Mutation: {
    // AddPost: rules.isAuthenticatedUser,
    // updateProfile: rules.isAuthenticatedUser,
    // deletePost: rules.isPostOwner,
    // incrementPostViewCount: rules.isAuthenticatedUser,
    // togglePublishPost: rules.isPostOwner,
  },
},

{
    fallbackError: async (thrownThing, parent, args, context, info) => {
      if (thrownThing instanceof ApolloError) {
        // expected errors
        return thrownThing
      } else if (thrownThing instanceof Error) {
        // unexpected errors
        console.error(thrownThing)
        // await Sentry.report(thrownThing)
        return new ApolloError('Internal server error', 'ERR_INTERNAL_SERVER')
      } else {
        // what the hell got thrown
        console.error('The resolver threw something that is not an error.')
        console.error(thrownThing)
        return new ApolloError('Internal server error', 'ERR_INTERNAL_SERVER')
      }
    },
  },


)
