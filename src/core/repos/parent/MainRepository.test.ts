import { ParentRepository } from './MainRepository';
import { Types } from 'mongoose';
import * as connection from 'services/mongoose/connections';

describe('MainRepository', () => {
  describe('ParentRepository', () => {
    describe('shouldAddParticipantsInQuery', () => {
      test('should return true if number of particiapnts is zero', async () => {
        await expect(ParentRepository.shouldAddParticipantsInQuery(0)).resolves.toBeTruthy();
      });

      test('should return true if number of particiapnts is less than participant repository count', async () => {
        const participant = {
          _id: new Types.ObjectId()
        };

        const participant2 = {
          _id: new Types.ObjectId()
        };
        await connection.participantsConnection.collection('participants').insertOne(participant);
        await connection.participantsConnection.collection('participants').insertOne(participant2);

        await expect(ParentRepository.shouldAddParticipantsInQuery(1)).resolves.toBeTruthy();

        await connection.participantsConnection.collection('participants').deleteMany({});
      });

      test('should return false if number of particiapnts is greater than participant repository count', async () => {
        const participant = {
          _id: new Types.ObjectId()
        };

        const participant2 = {
          _id: new Types.ObjectId()
        };
        await connection.participantsConnection.collection('participants').insertOne(participant);
        await connection.participantsConnection.collection('participants').insertOne(participant2);

        await expect(ParentRepository.shouldAddParticipantsInQuery(5)).resolves.toBeFalsy();

        await connection.participantsConnection.collection('participants').deleteMany({});
      });
    });
  });
});
