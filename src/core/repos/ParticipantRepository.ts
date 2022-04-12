import * as connection from 'services/mongoose/connections';

export class ParticipantRepository {
  static estimatedDocumentCount(): Promise<number> {
    return connection.participantsConnection.collection('participants').estimatedDocumentCount();
  }
}
