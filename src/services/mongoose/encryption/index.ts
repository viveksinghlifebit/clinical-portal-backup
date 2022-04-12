import mongoose from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';

import { log as logger } from 'services/log';

const SECRET_LENGTH_BYTES = 32;
const SALT_LENGTH_BYTES = 16;

const assertBufferLength = (buffer: Buffer, len: number, errMsg: string): void => {
  if (buffer.length !== len) {
    logger.error(errMsg);
    throw new Error(errMsg);
  }
};

const assertParamExists = (param: string, errMsg: string): void => {
  if (!param) {
    logger.error(errMsg);
    throw new Error(errMsg);
  }
};

const bufferFromHex = (hexVal: string): Buffer => Buffer.from(hexVal, 'hex');

export function registerEncryptionPlugin<T>(options: {
  schema: mongoose.Schema<T>;
  featureFlag: boolean;
  fields: string[];
  secret: string;
  salt: string;
  schemaLabel: string;
}): void {
  const { schema, featureFlag, fields, secret, salt, schemaLabel } = options;

  if (!featureFlag) {
    logger.info(`mongoose encryption for ${schemaLabel} is not enabled`);
    return;
  }
  logger.info(`mongoose encryption for ${schemaLabel} is enabled`);

  assertParamExists(secret, 'missing mongoose encryption secret');
  assertParamExists(salt, 'missing mongoose encryption salt');

  const secretBuffer = bufferFromHex(secret);
  assertBufferLength(secretBuffer, SECRET_LENGTH_BYTES, 'invalid secret length');

  const saltBuffer = bufferFromHex(salt);
  assertBufferLength(saltBuffer, SALT_LENGTH_BYTES, 'invalid salt length');

  schema.plugin(fieldEncryption, {
    fields,
    secret: secretBuffer,
    saltGenerator: () => {
      // constant salt in order to search on encryped fields ref mongoose-field-encryption docs
      return saltBuffer;
    }
  });
}
