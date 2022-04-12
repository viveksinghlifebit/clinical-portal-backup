import { ParticipantRepository } from '../ParticipantRepository';

export class ParentRepository {
  static async shouldAddParticipantsInQuery(numberOfParticipants: number): Promise<boolean> {
    if (numberOfParticipants === 0) {
      return true;
    }
    return numberOfParticipants < (await ParticipantRepository.estimatedDocumentCount());
  }
}
