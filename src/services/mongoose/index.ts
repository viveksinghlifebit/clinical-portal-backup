import * as connections from './connections';
import * as models from '@core/models';

export const init = async (mongoMulti: Mongoose.Multi): Promise<void> => {
  await connections.init(mongoMulti);
  models.init({
    clinicalPortalConnection: connections.clinicalPortalConnection,
    exportConnection: connections.exportConnection,
    participantsConnection: connections.participantsConnection,
    genomarkersConnection: connections.genomarkersConnection,
    usersConnection: connections.usersConnection
  });
};
