import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();

    return users;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {
        params: { id },
      } = request;

      const user = await fastify.db.users.findOne({ key: 'id', equals: id });

      if (user) {
        return reply.send(user);
      }

      throw fastify.httpErrors.notFound('User is not found');
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { body } = request;

      const newUser = await fastify.db.users.create(body);

      return reply.send(newUser);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {
        params: { id },
      } = request;

      const uuidRegExp =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      const isValidId = uuidRegExp.test(id);

      if (isValidId) {
        const user = await fastify.db.users.findOne({ key: 'id', equals: id });

        if (user) {
          const profile = await fastify.db.profiles.findOne({
            key: 'userId',
            equals: id,
          });

          const posts = await fastify.db.posts.findMany({
            key: 'userId',
            equals: id,
          });

          const followers = await fastify.db.users.findMany({
            key: 'subscribedToUserIds',
            inArray: id,
          });

          if (profile) {
            await fastify.db.profiles.delete(profile.id);
          }

          if (posts.length) {
            posts.forEach(
              async (post) => await fastify.db.posts.delete(post.id)
            );
          }

          if (followers.length) {
            followers.forEach(async (follower) => {
              const updatedFollower = follower.subscribedToUserIds.filter(
                (f) => f !== id
              );

              await fastify.db.users.change(follower.id, {
                subscribedToUserIds: updatedFollower,
              });
            });
          }

          const deleteOperation = await fastify.db.users.delete(id);
          return reply.send(deleteOperation);
        }
        throw fastify.httpErrors.notFound('User is not found');
      }

      throw fastify.httpErrors.badRequest('Uuid is not valid');
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {
        body: { userId },
        params: { id },
      } = request;

      const subscriber = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      const subscribeTo = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      if (subscriber && subscribeTo) {
        const updatedSubscribedToUserIds = [
          ...subscribeTo.subscribedToUserIds,
          id,
        ];
        const changedUser = await fastify.db.users.change(userId, {
          subscribedToUserIds: updatedSubscribedToUserIds,
        });

        return reply.send(changedUser);
      }

      throw fastify.httpErrors.notFound('Not found');
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {
        body: { userId },
        params: { id },
      } = request;

      const subscriber = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      const unSubscribeFrom = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      if (subscriber && unSubscribeFrom) {
        if (unSubscribeFrom.subscribedToUserIds.includes(id)) {
          const updatedSubscribedToUserIds =
            unSubscribeFrom.subscribedToUserIds.filter((el) => el !== id);
          const changedUser = await fastify.db.users.change(userId, {
            subscribedToUserIds: updatedSubscribedToUserIds,
          });

          return reply.send(changedUser);
        }
      }

      throw fastify.httpErrors.badRequest('Bad request');
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {
        body,
        params: { id },
      } = request;

      const uuidRegExp =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      const isValidId = uuidRegExp.test(id);

      if (isValidId) {
        const updateUser = await fastify.db.users.change(id, body);

        return reply.send(updateUser);
      }

      throw fastify.httpErrors.badRequest('Uuid is not valid');
    }
  );
};

export default plugin;
