import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { UserEntity } from '../../../../utils/DB/entities/DBUsers';

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

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;

const CreateUserType = new GraphQLInputObjectType({
  name: 'CreateUserType',
  fields: () => ({
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const createUser = {
  type: UserType,
  args: {
    values: { type: CreateUserType },
  },
  resolve: async (
    _: any,
    { values }: { values: CreateUserDTO },
    fastify: FastifyInstance
  ) => {
    const newUser = await fastify.db.users.create(values);

    return newUser;
  },
};
