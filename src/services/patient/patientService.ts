import config from 'config';
import { IllegalArgumentError } from 'errors';

import mongoose from 'mongoose';
import { isEmpty, uniq } from 'lodash';
import { NumberUtils, PatientUtils } from 'utils';

import { PatientStatus } from '@core/enums';
import { Patient, PatientWorkgroup, Workgroup } from '@core/models';
import { WorkgroupService } from '@core/modules';
import { PatientDataService } from './patientDataService';
import { PhenotypeFieldRepository } from '@core/repos';
import { PhenotypeFiltersService } from 'services/filter';

export class PatientService {
  /**
   * Creates the patient.
   * @param input the input data
   * @param user  the user
   * @param team  the team
   */
  static async createPatient(
    input: CorePatient.WorkgroupPatientCreateInput,
    user: User,
    team: Team
  ): Promise<PatientWorkgroup.View> {
    // First validate the patientWorkgroup creation
    await PatientService.validateCreatePatient(input.patientId, input.workgroupName, String(team._id));
    // Then find the workgroup
    let workgroup = await Workgroup.findByNameAndTeam(input.workgroupName, String(team._id));
    // Otherwise create a new one (createOrUpdate)
    if (!workgroup) {
      workgroup = await WorkgroupService.createWorkgroup(input.workgroupName, team, user);
    }
    const patient = await Patient.findById(input.patientId);
    // Create the patient workgroup entry. The undefined fields will be created later
    // TODO some of the properties will be removed later, since the `Patient` entity will have this information.
    const patientAttributes: Partial<PatientWorkgroup.Attributes> = {
      associatedDiseasesWithTieredVariants: undefined,
      description: input.description,
      workgroup: workgroup._id,
      patient: patient?.view()
    };
    const patientWorkgroup = await PatientWorkgroup.create(patientAttributes);
    // Update the workgroup details
    // TODO to be changed: calculate patients on the fly
    workgroup.numberOfPatients = await PatientWorkgroup.countByWorkgroup(workgroup._id);
    await Workgroup.saveWorkgroup(workgroup);
    // Creates the patientWorkgroup data
    await PatientDataService.createPatientData(patientWorkgroup, patient?.i as string);
    // Save the patientWorkgroup
    await patientWorkgroup.save();

    return WorkgroupService.getWorkgroupPatientById(
      patientWorkgroup._id.toString(),
      workgroup._id,
      String(team._id)
    ) as Promise<PatientWorkgroup.View>;
  }

  /**
   * Validates the if patient can be created.
   * @param patientId the patient id
   * @param workgroupName the workgroup name
   * @param teamId the team id
   */
  static async validateCreatePatient(patientId: string, workgroupName: string, teamId: string): Promise<void> {
    // Validates the patient for the current team.
    const patient: Patient.Attributes = await Patient.findOne({ _id: patientId, team: teamId }).lean();
    if (!patient) {
      throw new IllegalArgumentError('The patient id provided doesnt exist.');
    }
    if (patient.status === PatientStatus.Drafted) {
      throw new IllegalArgumentError('The patient is not yet enrolled.');
    }
    const workgroup = await Workgroup.findByNameAndTeam(workgroupName, teamId);
    // if workgroup already exists in the team
    if (workgroup) {
      // Check if the patient already exists in the same workspace
      const patientsCount = await PatientWorkgroup.countByWorkgroupAndPatient(
        workgroup._id,
        new mongoose.Types.ObjectId(patientId)
      );
      // If exists the return validation error
      if (patientsCount > 0) {
        throw new IllegalArgumentError(
          'The patient already exists in the workgroup. Please specify a new one, or add different patient'
        );
      }
    }
  }

  /**
   * Returns the patient fields
   * @param fields the patient workgroup fields
   * @param patient the patient view
   */
  static async getPatientFields(
    fields: PatientWorkgroup.Attributes['fields'] = [],
    patient: Patient.View
  ): Promise<Array<PatientWorkgroup.WithValues>> {
    const initFilters = config.individualBrowser.patient.initFilters;
    const initFiltersLabels = new Set(config.individualBrowser.patient.initFilters.map(({ label }) => label));
    const allFilters = [...initFilters, ...fields];
    const promises = allFilters.map((filter) => {
      return PhenotypeFiltersService.getFilterValuesForParticipant(
        patient.i,
        filter.filterId,
        filter.instance,
        isEmpty(filter.array) ? undefined : filter.array
      );
    });

    const filtersIds = uniq(allFilters.map((filter) => filter.filterId));
    const filtersDefinition = await PhenotypeFieldRepository.find({ id: { $in: filtersIds } });
    const values = await Promise.all(promises);

    const filtersWithValue = allFilters.map((filter, index) => {
      return {
        filter,
        value: values[index],
        filterDefinition: filtersDefinition.find(
          (filterDef) => filterDef.id === NumberUtils.castToNumberIfPossible(filter.filterId)
        )
      };
    });

    const phenotypes = filtersWithValue.map((filterWithValue) => {
      const key = `instance${filterWithValue.filter.instance}Name` as keyof PhenotypeField.Attributes;
      return {
        readOnly: initFiltersLabels.has(filterWithValue.filter.label),
        filterId: filterWithValue.filter.filterId,
        label: filterWithValue.filter.label
          ? filterWithValue.filter.label
          : `${filterWithValue.filterDefinition?.name}:`,
        value: filterWithValue.value as string,
        instance: filterWithValue.filter.instance,
        array: filterWithValue.filter.array,
        instanceNames: (filterWithValue.filterDefinition && [filterWithValue.filterDefinition[key]]) || []
      };
    });
    const addresses = patient.addresses.map((address, index) => {
      const addressLabel = `Address${patient.addresses.length === 1 ? '' : ` ${index + 1}`}:`;
      return PatientUtils.createPatientFieldForIdentifiable(
        addressLabel,
        PatientUtils.getAddressToDisplay(address, '-')
      );
    });
    const identifiableData = [
      PatientUtils.createPatientFieldForIdentifiable('Date of Birth:', patient.dateOfBirth),
      PatientUtils.createPatientFieldForIdentifiable('Email:', patient.email),
      PatientUtils.createPatientFieldForIdentifiable('Phone Number:', patient.phoneNumber),
      ...addresses
    ];
    return [...identifiableData, ...phenotypes] as Array<PatientWorkgroup.WithValues>;
  }
}
