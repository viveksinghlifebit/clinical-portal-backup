import { errorHandlers } from './handlers/errorHandlers';
import postResponseHandler from './handlers/validateApiResponse';

const operations: { [id: string]: OpenApiBackend.Handler } = {
  ...errorHandlers,
  // The key of the operation needs to be 'postResponseHandler'
  // https://github.com/anttiviljami/openapi-backend/blob/master/DOCS.md#postresponsehandler-handler
  postResponseHandler
};

export default operations;
