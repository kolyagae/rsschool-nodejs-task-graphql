import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    const types = await fastify.db.memberTypes.findMany();
    return reply.send(types);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const type = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (type) {
        return reply.send(type);
      }

      throw fastify.httpErrors.notFound('Type is not found');
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const type = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (type) {
        const updatedType = await fastify.db.memberTypes.change(
          request.params.id,
          request.body
        );
        return reply.send(updatedType);
      }

      throw fastify.httpErrors.badRequest('Type with this id is not exists');
    }
  );
};

export default plugin;
