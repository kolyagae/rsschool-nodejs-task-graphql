import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { PostEntity } from '../../../../utils/DB/entities/DBPosts';

export const PostType = new GraphQLObjectType({
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

type CreatePostDTO = Omit<PostEntity, 'id'>;

const CreatePostType = new GraphQLInputObjectType({
  name: 'CreatePostType',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const createPost = {
  type: PostType,
  args: {
    values: { type: CreatePostType },
  },
  resolve: async (
    _: any,
    { values }: { values: CreatePostDTO },
    fastify: FastifyInstance
  ) => {
    const uuidRegExp =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    const isValidId = uuidRegExp.test(values.userId);

    if (isValidId) {
      const newPost = await fastify.db.posts.create(values);
      return newPost;
    }

    throw fastify.httpErrors.badRequest('Uuid is not valid');
  },
};

type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;

const ChangePostType = new GraphQLInputObjectType({
  name: 'ChangePostType',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  }),
});

export const changePost = {
  type: PostType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    values: { type: ChangePostType },
  },
  resolve: async (
    _: any,
    { id, values }: { id: string; values: ChangePostDTO },
    fastify: FastifyInstance
  ) => {
    const uuidRegExp =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    const isValidId = uuidRegExp.test(id);

    if (isValidId) {
      const updatedPost = await fastify.db.posts.change(id, { ...values });
      return updatedPost;
    }

    throw fastify.httpErrors.badRequest('Uuid is not valid');
  },
};
