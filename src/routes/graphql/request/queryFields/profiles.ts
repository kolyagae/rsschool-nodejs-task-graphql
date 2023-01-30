import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { ProfileEntity } from '../../../../utils/DB/entities/DBProfiles';

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

type CreateProfileDTO = Omit<ProfileEntity, 'id'>;

const CreateProfileType = new GraphQLInputObjectType({
  name: 'CreateProfileType',
  fields: () => ({
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

export const createProfile = {
  type: ProfileType,
  args: {
    values: { type: CreateProfileType },
  },
  resolve: async (
    _: any,
    { values }: { values: CreateProfileDTO },
    fastify: FastifyInstance
  ) => {
    const uuidRegExp =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    const isValidId = uuidRegExp.test(values.userId);
    const isMemberTypeExists = await fastify.db.memberTypes.findOne({
      key: 'id',
      equals: values.memberTypeId,
    });
    const isProfileExists = await fastify.db.profiles.findOne({
      key: 'userId',
      equals: values.userId,
    });
    const isUserExists = await fastify.db.users.findOne({
      key: 'id',
      equals: values.userId,
    });

    if (isValidId && isMemberTypeExists && !isProfileExists && isUserExists) {
      const newProfile = await fastify.db.profiles.create(values);
      return newProfile;
    }

    throw fastify.httpErrors.badRequest(
      'Uuid is not valid or membertype is not exist or profile is already exist or user is not exist'
    );
  },
};
