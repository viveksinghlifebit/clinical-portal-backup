import createApp from 'createApp';

import * as testSetup from './testSetup';

import * as thisModule from '.';

describe('loadEndpoints', () => {
  const app = createApp();

  const mockSpecification = testSetup.getMockApiSpecification();
  const mockDocumentedEndpoints = testSetup.getMockDocumentedEndpointsInfo();
  const mockNonDocumentedEndpoints = testSetup.getMockNonDocumentedEndpointsInfo();

  beforeEach(() => {
    // The "as any" is just so we can provide a document to the function instead of a
    // path to the specification file, which makes for easier testing.
    jest.spyOn(thisModule, '_getApiSpecification').mockReturnValue(mockSpecification);
    jest.spyOn(app, 'use');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('If trying to register methods that are not in the documentation, throw an error.', async () => {
    const result = thisModule.loadEndpoints(app, { ...mockDocumentedEndpoints, ...mockNonDocumentedEndpoints }, '');
    for (const operationId of Object.keys(mockNonDocumentedEndpoints)) {
      await expect(result).rejects.toThrowError(`Unknown operationId ${operationId}. Refusing to register handler`);
    }
  });

  test('If called with a valid API specification, check that the correct methods are called.', async () => {
    await thisModule.loadEndpoints(app, mockDocumentedEndpoints, '');
    expect(app.use).toHaveBeenCalledTimes(2);
  });
});
