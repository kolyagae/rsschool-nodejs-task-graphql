import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: { type: GraphQLID },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLID },
  }),
});

export const ProfileQueryField = {
  type: ProfileType,
  args: { id: { type: GraphQLID } },
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const profile = await fastify.db.profiles.findOne({
      key: 'id',
      equals: args.id,
    });

    if (profile) {
      return profile;
    }

    throw fastify.httpErrors.notFound('Profile is not found');
  },
};

export const ProfilesQueryField = {
  type: new GraphQLList(ProfileType),
  resolve: async (
    _: any,
    _args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const profiles = await fastify.db.profiles.findMany();
    return profiles;
  },
};
