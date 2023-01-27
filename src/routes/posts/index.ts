import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    const posts = await fastify.db.posts.findMany();
    return reply.send(posts);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {
        params: { id },
      } = request;

      const post = await fastify.db.posts.findOne({
        key: 'id',
        equals: id,
      });

      if (post) {
        return reply.send(post);
      }

      throw fastify.httpErrors.notFound('Post is not found');
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {
        body,
        body: { userId },
      } = request;
      const uuidRegExp =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      const isValidId = uuidRegExp.test(userId);

      if (isValidId) {
        const newPost = await fastify.db.posts.create(body);
        return reply.send(newPost);
      }

      throw fastify.httpErrors.badRequest('Uuid is not valid');
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {
        params: { id },
      } = request;
      const uuidRegExp =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      const isValidId = uuidRegExp.test(id);

      if (isValidId) {
        const post = await fastify.db.posts.findOne({
          key: 'id',
          equals: id,
        });

        if (post) {
          return reply.send(await fastify.db.posts.delete(id));
        }

        throw fastify.httpErrors.notFound('Post is not found');
      }

      throw fastify.httpErrors.badRequest('Uuid is not valid');
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {
        params: { id },
        body,
      } = request;
      const uuidRegExp =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      const isValidId = uuidRegExp.test(id);

      if (isValidId) {
        const updatedPost = await fastify.db.posts.change(id, body);
        return reply.send(updatedPost);
      }

      throw fastify.httpErrors.badRequest('Uuid is not valid');
    }
  );
};

export default plugin;
