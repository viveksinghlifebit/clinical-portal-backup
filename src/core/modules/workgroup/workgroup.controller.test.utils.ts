import { PatientStatus } from '@core/enums';
import { PatientSample, PatientSampleSequencingLibrary, PatientWorkgroup } from '@core/models';
import mongoose from 'mongoose';
import { PatientWorkgroupBuilder } from 'testUtils';
import { PatientBuilder } from 'testUtils/patientBuilder';

export function prepareSpyForPatientWorkgroup(user: User, workgroup: Workgroup.Document): void {
  const patienSampleSpy: jest.SpyInstance = jest.spyOn(PatientSample, 'find');
  patienSampleSpy.mockResolvedValue([
    {
      view: jest.fn().mockReturnValue({
        owner: user,
        sampleId: 'sampleId'
      })
    }
  ]);

  const patientSampleSequencingLibrarySpy: jest.SpyInstance = jest.spyOn(PatientSampleSequencingLibrary, 'find');
  patientSampleSequencingLibrarySpy.mockResolvedValue([
    {
      view: jest.fn().mockReturnValue({
        owner: user,
        sequencingId: 'sequencingId'
      })
    }
  ]);
  const patient = (new PatientBuilder()
    .withId(new mongoose.Types.ObjectId())
    .withI('P0000000001')
    .withExternalID('externalId')
    .withExternalIDType('type')
    .withStatus(PatientStatus.Drafted)
    .withName('aName')
    .withSurname('aSurname')
    .withAddress([
      {
        address1: 'address1',
        address2: 'address2',
        cityAndCountry: 'cityAndCountry',
        area: 'area'
      }
    ])
    .build() as unknown) as Patient.Document;
  patient.view = jest.fn().mockReturnValue(patient);

  const patientWorkgroup = (new PatientWorkgroupBuilder()
    .withId('1')
    .withWorkgroup(workgroup)
    .withPatient(patient)
    .build() as unknown) as PatientWorkgroup.Document;
  patientWorkgroup.save = jest.fn();
  patientWorkgroup.view = jest.fn().mockReturnValue(patientWorkgroup);
  patientWorkgroup.toJSON = jest.fn().mockImplementation(() => patientWorkgroup);

  const spyFindOne: jest.SpyInstance = jest.spyOn(PatientWorkgroup, 'findOne');
  spyFindOne.mockImplementationOnce(() => ({
    populate: () => patientWorkgroup
  }));
}
