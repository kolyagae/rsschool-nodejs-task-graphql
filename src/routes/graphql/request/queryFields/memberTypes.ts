import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { MemberTypeEntity } from '../../../../utils/DB/entities/DBMemberTypes';

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

export const MemberTypeQueryField = {
  type: MemberType,
  args: { id: { type: GraphQLID } },
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const type = await fastify.db.memberTypes.findOne({
      key: 'id',
      equals: args.id,
    });

    if (type) {
      return type;
    }

    throw fastify.httpErrors.notFound('Type is not found');
  },
};

export const MemberTypesQueryField = {
  type: new GraphQLList(MemberType),
  resolve: async (
    _: any,
    _args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const types = await fastify.db.memberTypes.findMany();

    return types;
  },
};

type ChangeMemberTypeDTO = Partial<Omit<MemberTypeEntity, 'id'>>;

const ChangeMemberType = new GraphQLInputObjectType({
  name: 'ChangeMemberType',
  fields: () => ({
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

export const changeType = {
  type: MemberType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    values: { type: ChangeMemberType },
  },
  resolve: async (
    _: any,
    { id, values }: { id: string; values: ChangeMemberTypeDTO },
    fastify: FastifyInstance
  ) => {
    const type = await fastify.db.memberTypes.findOne({
      key: 'id',
      equals: id,
    });

    if (type) {
      const updatedType = await fastify.db.memberTypes.change(id, {
        ...values,
      });
      return updatedType;
    }

    throw fastify.httpErrors.badRequest('Type with this id is not exists');
  },
};
