import { HttpStatusCodes } from 'enums';

import AbstractHttpError from './AbstractHttpError';

class NotFoundHttpError extends AbstractHttpError implements App.ErrorForm {
  constructor(message?: string) {
    super(message || 'Not Found.', HttpStatusCodes.NotFound, HttpStatusCodes[HttpStatusCodes.NotFound]);
    Object.setPrototypeOf(this, NotFoundHttpError.prototype);
  }
}

export default NotFoundHttpError;
