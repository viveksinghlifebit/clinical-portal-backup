import OpenApiBackend, { Document, OpenAPIBackend, Handler } from 'openapi-backend';

export const createOpenApiBackend = (
  handlers: { [id: string]: Handler | undefined },
  definition: string | Document
): OpenAPIBackend =>
  new OpenApiBackend({
    strict: true,
    handlers,
    validate: true,
    definition,
    ajvOpts: { nullable: true }
  });
