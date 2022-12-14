import { HttpStatusCodes } from 'enums';
import { ResponseValidationHttpError } from 'errors/http-errors';

import * as validateApiResponse from './validateApiResponse';

const mockValidateResponseWithoutErrors = (): { valid: boolean; errors: null } => ({ valid: true, errors: null });
const mockValidateResponseWithErrors = (): { valid: boolean; errors: Record<string, string>[] } => ({
  valid: false,
  errors: [
    {
      keyword: 'mockKeyword',
      dataPath: '.mockDataPath',
      schemaPath: '#/mock/schema/path',
      message: 'mockMessage'
    }
  ]
});

describe('validateApiResponse', () => {
  let c: OpenApiBackend.Context;
  let ctx: Koa.ParameterizedContext<App.State, App.Context>;

  beforeEach(() => {
    c = ({
      api: {
        validateResponse: jest.fn().mockReturnValue(mockValidateResponseWithoutErrors())
      }
    } as unknown) as OpenApiBackend.Context;
    ctx = ({
      res: {
        headersSent: false
      }
    } as unknown) as Koa.ParameterizedContext<App.State, App.Context>;
    jest.spyOn(validateApiResponse, '_shouldValidationBeSkipped');
  });

  afterEach(jest.restoreAllMocks);

  test('When the response was already sent, expect not to validate response.', () => {
    ctx.res.headersSent = true;
    validateApiResponse.default(c, ctx);
    expect(validateApiResponse._shouldValidationBeSkipped).toHaveBeenCalledTimes(1);
    expect(c.api.validateResponse).not.toHaveBeenCalled();
  });

  test('When the response status is 204, expect to return a HTTP NoContent response.', () => {
    ctx.status = HttpStatusCodes.NoContent;
    validateApiResponse.default(c, ctx);
    expect(validateApiResponse._shouldValidationBeSkipped).toHaveBeenCalledTimes(1);
    expect(c.api.validateResponse).not.toHaveBeenCalled();
    expect(ctx.status).toEqual(HttpStatusCodes.NoContent);
  });

  test('When the response is valid, expect not to throw.', () => {
    expect(() => validateApiResponse.default(c, ctx)).not.toThrow(ResponseValidationHttpError);
    expect(validateApiResponse._shouldValidationBeSkipped).toHaveBeenCalledTimes(1);
    expect(c.api.validateResponse).toHaveBeenCalledTimes(1);
  });

  test('When there are validation errors, expect not to throw.', () => {
    c.api.validateResponse = jest.fn().mockReturnValue(mockValidateResponseWithErrors());
    expect(() => validateApiResponse.default(c, ctx)).not.toThrow(ResponseValidationHttpError);
    expect(validateApiResponse._shouldValidationBeSkipped).toHaveBeenCalledTimes(1);
    expect(c.api.validateResponse).toHaveBeenCalledTimes(1);
  });
});
