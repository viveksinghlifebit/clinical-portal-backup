import { IllegalArgumentError } from '../../errors';
import { SequenceIdNames } from 'enums';
import { SequenceId } from './SequenceId';

describe('SequenceId', () => {
  let spySequenceFindOneAndUpdate: jest.SpyInstance;
  beforeEach(() => {
    spySequenceFindOneAndUpdate = jest.spyOn(SequenceId, 'findOneAndUpdate');
  });
  afterEach(jest.restoreAllMocks);

  describe('getNextByName', () => {
    afterEach(jest.restoreAllMocks);

    test('When called with a valid sequenceId name, then it should call proper method with expected args.', async () => {
      const sequenceIdName = ('test-name' as unknown) as SequenceIdNames;
      const sequenceId = { _id: 'test-id' };
      spySequenceFindOneAndUpdate.mockResolvedValueOnce(sequenceId);
      expect(await SequenceId.getNextByName(sequenceIdName)).toEqual(sequenceId);
      expect(SequenceId.findOneAndUpdate).toHaveBeenCalledWith(
        { name: sequenceIdName },
        { $inc: { value: 1 } },
        { new: true, runValidators: true }
      );
    });

    test('When called with an invalid sequenceId name, then it should throw.', async () => {
      const sequenceIdName = ('test-name' as unknown) as SequenceIdNames;
      spySequenceFindOneAndUpdate.mockResolvedValueOnce(undefined);
      await expect(SequenceId.getNextByName(sequenceIdName)).rejects.toThrow(IllegalArgumentError);
      expect(SequenceId.findOneAndUpdate).toHaveBeenCalledWith(
        { name: sequenceIdName },
        { $inc: { value: 1 } },
        { new: true, runValidators: true }
      );
    });
  });

  describe('getOrCreateNextByName', () => {
    afterEach(jest.restoreAllMocks);

    afterEach(jest.restoreAllMocks);

    test('When called with a valid sequenceId name, then it should call proper method with expected args.', async () => {
      const patient = 'P0000001';
      const sequenceId = { _id: 'test-id' };
      spySequenceFindOneAndUpdate.mockResolvedValueOnce(sequenceId);
      expect(await SequenceId.getOrCreateNextByName(patient)).toEqual(sequenceId);
      expect(SequenceId.findOneAndUpdate).toHaveBeenCalledWith(
        { name: patient },
        { $inc: { value: 1 } },
        { new: true, runValidators: true, upsert: true }
      );
    });
  });

  describe('toPadString', () => {
    test.each([
      [{ prefix: 'P', value: 4 }, 'P0000004'],
      [{ prefix: 'F', value: 1067 }, 'F0001067'],
      [{ prefix: 'H', value: 7948795 }, 'H7948795'],
      [{ prefix: undefined, value: undefined }, '0000000']
    ])('When called, then it should generate an ID string.', (ctx, expected) => {
      expect(new SequenceId(ctx).toPadString()).toEqual(expected);
    });
  });
});
