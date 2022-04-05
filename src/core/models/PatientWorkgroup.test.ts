import { Types } from 'mongoose'
import { PatientWorkgroup } from './PatientWorkgroup'
describe('PatientWorkgroup', () => {
  const getWorkgroup = (): PatientWorkgroup.Attributes => ({
    _id: new Types.ObjectId(),
    markers: [
      {
        _id: 'id',
        cn: 'cn',
        location: 'location'
      }
    ],
    comparisonFilters: [1],
    workgroup: 'workgroup',
    description: 'description',
    markersDefinition: [
      {
        cn: 'cn',
        fullLocation: 'f',
        gene: 'g',
        id: 1,
        index: 1
      }
    ],
    igvFiles: ['test'],
    associatedDiseasesWithTieredVariants: [
      {
        gene: 'gene',
        phenotype: 'phenotype',
        tier1: 1,
        tier2: 2,
        tier3: 3
      }
    ],
    diseaseGene: {
      test: 'Test'
    },
    tierSNV: { tier1: 1, tier3: 3, tier2: 2 },
    patient: 'patient',
    fields: [
      {
        filterId: 'filterId',
        instance: ['instance'],
        array: ['array'],
        userAdded: false
      }
    ],
    createdAt: new Date('2021-05-24'),
    updatedAt: new Date('2021-05-26')
  })
  beforeEach(() => {
    jest.spyOn(PatientWorkgroup, 'count').mockResolvedValue(10)
  })
  afterEach(jest.restoreAllMocks)
  describe('view', () => {
    test('When called, then it should transform PatientWorkgroup properly.', () => {
      const workgroup = getWorkgroup()
      const patientWorkGroup = new PatientWorkgroup(workgroup)
      expect(patientWorkGroup.view()).toMatchObject({
        _id: workgroup._id.toHexString()
      })
    })
  })

  describe('countByWorkgroupAndPatient', () => {
    test('When called, then it should return count.', async () => {
      const result = await PatientWorkgroup.countByWorkgroupAndPatient(new Types.ObjectId(), new Types.ObjectId())
      expect(result).toBe(10)
    })
  })

  describe('countByWorkgroup', () => {
    test('When called, then it it should return count.', async () => {
      const result = await PatientWorkgroup.countByWorkgroup(new Types.ObjectId())
      expect(result).toBe(10)
    })
  })
})
