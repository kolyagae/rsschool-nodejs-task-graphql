import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    const profiles = await fastify.db.profiles.findMany();
    return reply.send(profiles);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const {
        params: { id },
      } = request;
      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: id,
      });

      if (profile) {
        return reply.send(profile);
      }

      throw fastify.httpErrors.notFound('Profile is not found');
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const {
        body,
        body: { userId },
      } = request;
      const uuidRegExp =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      const isValidId = uuidRegExp.test(userId);
      const isMemberTypeExists = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: request.body.memberTypeId,
      });
      const isProfileExists = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: userId,
      });
      const isUserExists = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      if (isValidId && isMemberTypeExists && !isProfileExists && isUserExists) {
        const newProfile = await fastify.db.profiles.create(body);
        return reply.send(newProfile);
      }

      throw fastify.httpErrors.badRequest(
        'Uuid is not valid or membertype is not exist or profile is already exist'
      );
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const {
        params: { id },
      } = request;
      const uuidRegExp =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      const isValidId = uuidRegExp.test(id);
      if (isValidId) {
        return reply.send(await fastify.db.profiles.delete(id));
      }

      throw fastify.httpErrors.badRequest('Uuid is not valid');
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const {
        body,
        params: { id },
      } = request;

      const isProfileExists = await fastify.db.profiles.findOne({
        key: 'id',
        equals: id,
      });

      if (isProfileExists) {
        const updateProfile = await fastify.db.profiles.change(id, { ...body });

        return reply.send(updateProfile);
      }

      throw fastify.httpErrors.badRequest('Profile is not existed');
    }
  );
};

export default plugin;
