import { AuditTrailService } from 'modules/auditTrail/auditTrail.controller'
import config from 'config'
import { auditTrail } from '.'
describe('auditTrail', () => {
  let mockAuditTrailService: jest.SpyInstance
  beforeAll(() => {
    mockAuditTrailService = jest.spyOn(AuditTrailService, 'log')
  })
  afterEach(() => {
    config.hkgiEnvironmentEnabled = false
    jest.clearAllMocks()
  })

  afterAll(jest.restoreAllMocks)
  test('should log in AuditTrailService if hkgiEnvironment is enabled', async () => {
    config.hkgiEnvironmentEnabled = true
    mockAuditTrailService.mockResolvedValue(undefined)

    await auditTrail({ state: {}, request: {}, response: {} } as Koa.Context)

    expect(mockAuditTrailService).toHaveBeenCalledTimes(1)
  })

  test('should not log in AuditTrailService if hkgiEnvironment is not enabled', async () => {
    await auditTrail({ state: {}, request: {}, response: {} } as Koa.Context)
    expect(mockAuditTrailService).toHaveBeenCalledTimes(0)
  })
})
