import { Types } from 'mongoose';
import * as connection from 'services/mongoose/connections';

import { TeamRepository } from './index';

describe('TeamRepository', () => {
  afterAll(jest.restoreAllMocks);

  describe('findById', () => {
    it('should not return any team if _id mismatches with the user saved in DB', async () => {
      await expect(TeamRepository.findById(new Types.ObjectId().toHexString())).resolves.toBe(null);
    });

    it('should return the team with matching Id from the database', async () => {
      const team = {
        _id: new Types.ObjectId()
      };
      await connection.usersConnection.collection('teams').insertOne(team);

      await expect(TeamRepository.findById(team._id.toHexString())).resolves.toMatchObject(team);

      await connection.usersConnection.collection('teams').deleteOne({ _id: team._id });
    });
  });

  describe('findOne', () => {
    it('should return the team with matching attribute from the database', async () => {
      const team = {
        _id: new Types.ObjectId(),
        name: 'test'
      };
      await connection.usersConnection.collection('teams').insertOne(team);

      await expect(TeamRepository.findOne({ name: 'test' })).resolves.toMatchObject(team);

      await connection.usersConnection.collection('teams').deleteOne({ _id: team._id });
    });
  });

  describe('find', () => {
    it('should return the all the teams if {} is passed as arguments', async () => {
      const teams = [
        {
          _id: new Types.ObjectId(),
          name: 'test-1'
        },
        {
          _id: new Types.ObjectId(),
          name: 'test-2'
        }
      ];
      await connection.usersConnection.collection('teams').insertMany(teams);

      await expect(TeamRepository.find({})).resolves.toMatchObject(teams);

      await connection.usersConnection.collection('teams').deleteMany({ _id: { $in: teams.map(({ _id }) => _id) } });
    });
  });
});
