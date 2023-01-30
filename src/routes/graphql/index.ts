import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, parse, validate } from 'graphql';
import { graphqlBodySchema } from './schema';
import { schema } from './request/schema';
import * as depthLimit from 'graphql-depth-limit';

const limit = 6;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      if (!request.body.query) {
        throw fastify.httpErrors.badRequest();
      }

      const valid = validate(schema, parse(request.body.query), [
        depthLimit(limit),
      ]);

      if (valid.length) {
        reply.send({ errors: valid });
      }

      return await graphql({
        schema: schema,
        source: String(request.body.query),
        contextValue: fastify,
        variableValues: request.body.variables,
      });
    }
  );
};

export default plugin;
