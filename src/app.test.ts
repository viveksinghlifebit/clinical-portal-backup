import config from 'config';

const mockApp = {
  listen: jest.fn()
};
const mockRoutes = {};
const mockCreateApp = jest.fn().mockReturnValue(mockApp);
const mockLoadEndpoints = jest.fn().mockResolvedValue(mockApp);

const mockInitDB = jest.fn().mockResolvedValue(undefined);
jest.mock('./services/mongoose/index', () => ({
  init: mockInitDB
}));
jest.mock('./createApp', () => mockCreateApp);
jest.mock('./api/validation', () => ({ loadEndpoints: mockLoadEndpoints }));
jest.mock('./api/routes', () => mockRoutes);

describe('app', () => {
  afterAll(jest.restoreAllMocks);

  test('When successfully loaded, then it should call the appropriate methods.', async () => {
    await require('./app');
    expect(mockCreateApp).toHaveBeenCalledTimes(1);
    expect(mockLoadEndpoints).toHaveBeenCalledTimes(1);
    expect(mockLoadEndpoints).toHaveBeenCalledWith(mockApp, mockRoutes, config.apiPrefix);
    expect(mockInitDB).toHaveBeenCalledTimes(1);
    expect(mockApp.listen).toHaveBeenCalledTimes(1);
  });
});
