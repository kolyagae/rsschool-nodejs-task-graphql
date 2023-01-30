import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} from 'graphql';

const PostType = new GraphQLObjectType({
  name: 'PostType',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  }),
});

export const PostQueryField = {
  type: PostType,
  args: { id: { type: GraphQLID } },
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const post = await fastify.db.posts.findOne({
      key: 'id',
      equals: args.id,
    });

    if (post) {
      return post;
    }

    throw fastify.httpErrors.notFound('Post is not found');
  },
};

export const PostsQueryField = {
  type: new GraphQLList(PostType),
  resolve: async (
    _: any,
    _args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const posts = await fastify.db.posts.findMany();

    return posts;
  },
};
