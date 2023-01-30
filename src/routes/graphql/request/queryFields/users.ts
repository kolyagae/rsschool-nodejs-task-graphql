import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} from 'graphql';

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
  }),
});

export const UserQueryField = {
  type: UserType,
  args: { id: { type: GraphQLID } },
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const user = await fastify.db.users.findOne({ key: 'id', equals: args.id });

    if (user) {
      return user;
    }

    throw fastify.httpErrors.notFound('User is not found');
  },
};

export const UsersQueryField = {
  type: new GraphQLList(UserType),
  resolve: async (
    _: any,
    _args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const users = await fastify.db.users.findMany();

    return users;
  },
};
