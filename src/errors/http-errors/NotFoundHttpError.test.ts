import { HttpStatusCodes } from 'enums';

import NotFoundHttpError from './NotFoundHttpError';

describe('NotFoundHttpError', () => {
  test('Should correctly create an instance of NotFoundHttpError', () => {
    const message = 'Test NotFoundHttpError message';
    const notFoundHttpError = new NotFoundHttpError(message);
    expect(notFoundHttpError).toBeInstanceOf(NotFoundHttpError);
    expect(notFoundHttpError.status).toEqual(HttpStatusCodes.NotFound);
    expect(notFoundHttpError.errorName).toEqual(HttpStatusCodes[HttpStatusCodes.NotFound]);
    expect(notFoundHttpError.message).toEqual(message);
  });
});
