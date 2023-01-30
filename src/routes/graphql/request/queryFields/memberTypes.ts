import { FastifyInstance } from 'fastify';
import { GraphQLObjectType, GraphQLID, GraphQLInt, GraphQLList } from 'graphql';

const MemberType = new GraphQLObjectType({
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
