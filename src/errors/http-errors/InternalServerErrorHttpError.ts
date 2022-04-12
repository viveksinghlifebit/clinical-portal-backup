import { HttpStatusCodes } from 'enums';

import AbstractHttpError from './AbstractHttpError';

class InternalServerErrorHttpError extends AbstractHttpError implements App.ErrorForm {
  sourceError?: Error;
  constructor(message?: string, sourceError?: Error) {
    super(
      message || 'Internal server error.',
      HttpStatusCodes.InternalServerError,
      HttpStatusCodes[HttpStatusCodes.InternalServerError]
    );
    this.sourceError = sourceError;
    Object.setPrototypeOf(this, InternalServerErrorHttpError.prototype);
  }
}

export default InternalServerErrorHttpError;
