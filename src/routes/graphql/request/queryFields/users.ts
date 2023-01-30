import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLOutputType,
} from 'graphql';
import { ProfileEntity } from '../../../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../../../utils/DB/entities/DBUsers';
import { MemberType } from './memberTypes';
import { PostType } from './posts';
import { ProfileType } from './profiles';

const UserType: GraphQLOutputType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    userPosts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, _args, fastify: FastifyInstance) => {
        const userPosts = await fastify.db.posts.findMany({
          key: 'userId',
          equals: parent.id,
        });

        return userPosts;
      },
    },
    userProfile: {
      type: ProfileType,
      resolve: async (parent, _args, fastify: FastifyInstance) => {
        const userProfile: ProfileEntity | null =
          await fastify.db.profiles.findOne({
            key: 'userId',
            equals: parent.id,
          });

        return userProfile;
      },
    },
    userMemberType: {
      type: MemberType,
      resolve: async (parent, _args, fastify: FastifyInstance) => {
        const userProfile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: parent.id,
        });

        if (userProfile) {
          const userMemberType = await fastify.db.memberTypes.findOne({
            key: 'id',
            equals: userProfile.memberTypeId,
          });

          return userMemberType;
        }
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (parent: UserEntity, _args, fastify: FastifyInstance) => {
        const users = await fastify.db.users.findMany({
          key: 'subscribedToUserIds',
          inArray: parent.id,
        });

        return users;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (parent: UserEntity, _args, fastify: FastifyInstance) => {
        const followers = Promise.all(
          parent.subscribedToUserIds.map(async (followerId) => {
            return await fastify.db.users.findOne({
              key: 'id',
              equals: followerId,
            });
          })
        );

        return followers;
      },
    },
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

type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

const ChangeUserType = new GraphQLInputObjectType({
  name: 'ChangeUserType',
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

export const changeUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    values: { type: ChangeUserType },
  },
  resolve: async (
    _: any,
    { id, values }: { id: string; values: ChangeUserDTO },
    fastify: FastifyInstance
  ) => {
    const uuidRegExp =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    const isValidId = uuidRegExp.test(id);

    if (isValidId) {
      const updateUser = await fastify.db.users.change(id, { ...values });

      return updateUser;
    }

    throw fastify.httpErrors.badRequest('Uuid is not valid');
  },
};

const subscribeToUserType = new GraphQLInputObjectType({
  name: 'subscribeToUserType',
  fields: () => ({
    userId: { type: new GraphQLNonNull(GraphQLID) },
    id: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

export const subscribeToUser = {
  type: UserType,
  args: {
    values: { type: subscribeToUserType },
  },
  resolve: async (
    _: any,
    { values }: { values: Record<string, string> },
    fastify: FastifyInstance
  ) => {
    const subscriber = await fastify.db.users.findOne({
      key: 'id',
      equals: values.id,
    });

    const subscribeTo = await fastify.db.users.findOne({
      key: 'id',
      equals: values.userId,
    });

    if (subscriber && subscribeTo) {
      const updatedSubscribedToUserIds = [
        ...subscribeTo.subscribedToUserIds,
        values.id,
      ];
      const changedUser = await fastify.db.users.change(values.userId, {
        subscribedToUserIds: updatedSubscribedToUserIds,
      });

      return changedUser;
    }

    throw fastify.httpErrors.notFound('Not found');
  },
};

export const unsubscribeFrom = {
  type: UserType,
  args: {
    values: { type: subscribeToUserType },
  },
  resolve: async (
    _: any,
    { values }: { values: Record<string, string> },
    fastify: FastifyInstance
  ) => {
    const subscriber = await fastify.db.users.findOne({
      key: 'id',
      equals: values.id,
    });

    const unSubscribeFrom = await fastify.db.users.findOne({
      key: 'id',
      equals: values.userId,
    });

    if (subscriber && unSubscribeFrom) {
      if (unSubscribeFrom.subscribedToUserIds.includes(values.id)) {
        const updatedSubscribedToUserIds =
          unSubscribeFrom.subscribedToUserIds.filter((el) => el !== values.id);
        const changedUser = await fastify.db.users.change(values.userId, {
          subscribedToUserIds: updatedSubscribedToUserIds,
        });

        return changedUser;
      }
    }

    throw fastify.httpErrors.badRequest('Bad request');
  },
};
