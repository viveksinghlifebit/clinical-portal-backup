import { AuditTrailService } from '@core/modules/auditTrail/auditTrail.controller';
import { Types } from 'mongoose';
import config from 'config';
import { auditTrail } from '.';
describe('auditTrail', () => {
  let mockAuditTrailService: jest.SpyInstance;
  beforeAll(() => {
    mockAuditTrailService = jest.spyOn(AuditTrailService, 'log');
  });
  afterEach(() => {
    config.hkgiEnvironmentEnabled = false;
    jest.clearAllMocks();
  });

  afterAll(jest.restoreAllMocks);
  test('should log in AuditTrailService if hkgiEnvironment is enabled', async () => {
    config.hkgiEnvironmentEnabled = true;
    mockAuditTrailService.mockResolvedValue(undefined);

    await auditTrail({ state: {}, request: {}, response: {} } as Koa.Context);

    expect(mockAuditTrailService).toHaveBeenCalledTimes(1);
  });

  test('should not log in AuditTrailService if hkgiEnvironment is not enabled', async () => {
    await auditTrail({ state: {}, request: {}, response: {} } as Koa.Context);
    expect(mockAuditTrailService).toHaveBeenCalledTimes(0);
  });

  test('should log error in AuditTrailService if state holds error', async () => {
    config.hkgiEnvironmentEnabled = true;
    mockAuditTrailService.mockResolvedValue(undefined);
    const userId = new Types.ObjectId();
    const stateError = new Error('error');
    await auditTrail({
      state: {
        error: stateError,
        user: {
          _id: userId
        }
      },
      request: {},
      response: {}
    } as Koa.Context);

    expect(mockAuditTrailService).toHaveBeenCalledTimes(1);
    expect(mockAuditTrailService).toHaveBeenCalledWith(
      `Method: (undefined), Url: "undefined"`,
      'error',
      undefined,
      expect.objectContaining({
        error: stateError,
        request: expect.any(Object),
        response: expect.any(Object)
      }),
      userId
    );
  });
});
