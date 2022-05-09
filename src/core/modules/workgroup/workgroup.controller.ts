import { Types } from 'mongoose';
import { ClinicalRole } from '@core/enums';
import { PatientSample, PatientSampleSequencingLibrary, PatientWorkgroup, Workgroup } from '@core/models';
import { GenoMarkerRepository, PhenotypeFieldRepository, UserRepository } from '@core/repos';
import { IllegalArgumentError, ResourceNotFoundError } from 'errors';
import { isEmpty, keyBy } from 'lodash';
import { PatientService } from 'services/patient';
import { constructWorkgroupsSearchCriteria, NumberUtils } from 'utils';
import { IndividualComparisonService } from '../comparison';

export class WorkgroupService {
  /**
   * Creates the workgroup.
   * @param name  the name
   * @param team  the team
   * @param user  the user
   */
  static async createWorkgroup(name: string, team: Team, user: User): Promise<Workgroup.Document> {
    return Workgroup.saveWorkgroup({
      name,
      numberOfPatients: 0,
      owner: user._id as Mongoose.ObjectId,
      team: team._id as Mongoose.ObjectId
    });
  }

  /**
   * Deletes a workgroup and it's associated patients
   *
   * @param  {string} workgroupId
   * @param  {Team} teamId
   * @returns Promise
   */
  static async deleteWorkgroup(workgroupId: string, teamId: string): Promise<void> {
    const workgroup = await Workgroup.findByIdAndTeam(workgroupId, teamId);
    if (!workgroup) {
      throw new IllegalArgumentError(`Cannot find workgroup with id ${workgroupId}.`);
    }
    await Workgroup.deleteWorkgroups({ _id: workgroupId, team: teamId });
    await PatientWorkgroup.remove({ workgroup: workgroupId });
  }

  /**
   * Search workgroups paginated
   *
   * @param  {SearchItem[]} searchCriteria
   * @param  {string} teamId
   * @param  {string} pageNumber
   * @param  {string} pageSize
   * @param  {string} sortBy
   * @param  {string} sortByType
   * @returns Promise<WorkgroupSearchData>
   */
  static async searchWorkgroups(
    searchCriteria: Filter.SearchItem[],
    teamId: string,
    user: User,
    { pageNumber, pageSize, sortBy, sortByType }: App.SearchPagingSpecs
  ): Promise<Workgroup.SearchData> {
    const perPage = pageSize ?? 20;
    const page = pageNumber ?? 0;
    const sort = sortBy && sortByType ? { [sortBy]: sortByType } : { createdAt: -1 };
    const criteria = await constructWorkgroupsSearchCriteria(searchCriteria, teamId);
    const allWorkgroups = await Workgroup.findWorkgroups(criteria, { perPage, page }, { sorting: sort });
    let workgroups = allWorkgroups.map((workgroup) => workgroup.view());
    const count = await Workgroup.countWorkgroups(criteria);
    let numberOfPages = 0;
    if (count % perPage === 0) {
      numberOfPages = count / perPage;
    } else {
      numberOfPages = Math.ceil(count / perPage);
    }
    if (
      user.rbacRoles &&
      user.rbacRoles.every(({ name }) =>
        [ClinicalRole.ReferringClinician, ClinicalRole.FieldSpecialist].includes(name as ClinicalRole)
      )
    ) {
      const workgroupIds = workgroups.map(({ _id }) => _id);
      const workgroupWithPatientCounts = await PatientWorkgroup.getRefererredPatientsCountWithWorkGroup(
        workgroupIds,
        user
      );
      const workgroupPatientCounts = keyBy(workgroupWithPatientCounts, '_id');
      workgroups = workgroups.map((workgroup) => ({
        ...workgroup,
        numberOfPatients: workgroupPatientCounts[String(workgroup._id)]?.patients ?? 0
      }));
    }
    await WorkgroupService.populateWorkgroups(workgroups);

    return {
      total: count,
      page: page,
      pages: numberOfPages,
      workgroups: workgroups
    };
  }

  /**
   * Populates workgroups with owners
   *
   * @param  {Workgroup[]} workgroups
   * @returns Promise<Workgroup[]>
   */
  static async populateWorkgroups(workgroups: Workgroup.View[]): Promise<Workgroup.View[]> {
    const promises = workgroups.map((item) => WorkgroupService.populateWorkgroupWithOwner(item));

    return Promise.all(promises);
  }

  /**
   * Populates workgroup with it's owner
   *
   * @param  {Workgroup} workgroup
   * @returns Promise<Workgroup>
   */
  static async populateWorkgroupWithOwner(workgroup: Workgroup.View): Promise<Workgroup.View> {
    const user = await UserRepository.findById(workgroup.owner as string, { password: 0 });
    workgroup.owner = user as User;
    return workgroup;
  }

  /**
   * Returns the workgroup patient.
   * @param workgroupPatientId the workgroup patient id
   * @param workgroupId the workgroup id
   * @param teamId  the team id
   * @param lean false to return the workgroup patient editable
   */
  static async getWorkgroupPatientById(
    workgroupPatientId: string,
    workgroupId: string,
    teamId: string,
    lean = true
  ): Promise<PatientWorkgroup.Document | PatientWorkgroup.View> {
    const workgroupPatient = await PatientWorkgroup.findOne({
      _id: workgroupPatientId,
      workgroup: workgroupId
    }).populate('workgroup patient comparisonFilters');
    if (!workgroupPatient) {
      throw new IllegalArgumentError('Cannot find patient with provided id.');
    }
    if (lean) {
      const patientDocument = workgroupPatient.patient as Patient.Document;
      const patientSamplesView = (await PatientSample.find({ patient: patientDocument._id })).map((patientSample) => {
        const { owner, ...sampleViewNoOwner } = patientSample.view((patientDocument.owner as unknown) as User);
        return sampleViewNoOwner as PatientSample.View;
      });
      const workgroupPatientJson = workgroupPatient.view();
      const patientSequencingView = (await PatientSampleSequencingLibrary.find({ patient: patientDocument._id })).map(
        (sequence) => {
          const { owner, ...sampleViewNoOwner } = sequence.view((patientDocument.owner as unknown) as User);
          return sampleViewNoOwner as PatientSampleSequencingLibrary.View;
        }
      );

      workgroupPatientJson.patient = {
        ...patientDocument.view(),
        samples: patientSamplesView,
        sequencingLibrary: patientSequencingView
      };

      workgroupPatientJson.fields = await PatientService.getPatientFields(
        workgroupPatient.fields,
        patientDocument.view()
      );
      return workgroupPatientJson;
    }
    // Validates the access to the workgroup patient.
    WorkgroupService.validateWorkgroupPatientAccess(workgroupPatient, teamId);
    return workgroupPatient;
  }

  /**
   * Validates workgroup patient access.
   * @param workgroupPatient  the workgroup patient
   * @param teamId  the team id
   */
  static validateWorkgroupPatientAccess(workgroupPatient: PatientWorkgroup.Document | undefined, teamId: string): void {
    if ((workgroupPatient?.workgroup as Workgroup.Attributes)?.team?.toString() !== teamId.toString()) {
      throw new IllegalArgumentError(`Cannot find patient with provided id.`);
    }
  }

  /**
   * Return the workgroup suggestions.
   * @param term  the term
   * @param teamId  the team id
   */
  static async getWorkgroupSuggestions(teamId: string, term?: string): Promise<Array<Workgroup.View>> {
    if (isEmpty(term)) {
      throw new IllegalArgumentError('The search term cannot be empty');
    }
    const searchTerm = term?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') as string;
    const workgroups = await Workgroup.findByTermAndTeam(searchTerm, teamId);
    const promises = workgroups.map((item) => WorkgroupService.populateWorkgroupWithOwner(item.view()));
    return Promise.all(promises);
  }

  /**
   * Return the workgroup by is.
   * @param workgroupId  the workgroup id
   * @param patientId  the patient id
   * @param teamId  the team id
   */
  static async deleteWorkgroupPatient(workgroupId: string, patientId: string, teamId: string): Promise<Workgroup.View> {
    // Load the workgroup and validate the access
    const workgroup = await Workgroup.findByIdAndTeam(workgroupId, teamId);
    if (!workgroup) {
      throw new ResourceNotFoundError(`Cannot find workgroup with id ${workgroupId}`);
    }
    // The delete the patient
    await PatientWorkgroup.remove({ workgroup: workgroupId, _id: patientId });
    // And count the number of participants in the workgroup
    workgroup.numberOfPatients = await PatientWorkgroup.countByWorkgroup(workgroup._id);
    await Workgroup.saveWorkgroup(workgroup);
    return WorkgroupService.populateWorkgroupWithOwner(workgroup.view());
  }

  /**
   * Saves the markers to the workgroup patient.
   * @param workgroupPatientId the workgroup patient id
   * @param workgroupId the workgroup id
   * @param teamId  the team id
   * @param markers the array of the genomics markers
   */
  static async saveWorkgroupPatientMarkers(
    workgroupPatientId: string,
    workgroupId: string,
    teamId: string,
    markers: Array<string> = []
  ): Promise<PatientWorkgroup.Document> {
    const workgroupPatient = await PatientWorkgroup.findOne({
      _id: workgroupPatientId,
      workgroup: workgroupId
    }).populate('workgroup');
    // Validates the access to the workgroup patient.
    WorkgroupService.validateWorkgroupPatientAccess(workgroupPatient as PatientWorkgroup.Document, teamId);
    // In case markers are empty, means the the user want to clean the saved markers.
    if (isEmpty(markers)) {
      workgroupPatient!.markers = [];
      workgroupPatient!.markersDefinition = [];
      await workgroupPatient!.save();
      // Trick to populate the patient at once.
      return WorkgroupService.getWorkgroupPatientById(
        workgroupPatientId,
        workgroupId,
        teamId
      ) as Promise<PatientWorkgroup.Document>;
    }
    // First find the geno markers
    const markersDefinition = await GenoMarkerRepository.findByCNs(markers);
    // The for each marker provided from the user, create an entity with cn and location
    workgroupPatient!.markers = markers.map((marker) => {
      return {
        cn: marker,
        location: markersDefinition?.find((itDef) => itDef.cn === marker)?.fullLocation ?? ''
      };
    });
    workgroupPatient!.markersDefinition = markersDefinition;
    await workgroupPatient!.save();
    return WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId
    ) as Promise<PatientWorkgroup.Document>;
  }

  /**
   * Returns the workgroup patient.
   * @param workgroupId the workgroup id
   * @param teamId  the team id
   */
  static async getWorkgroupPatients(
    workgroupId: string,
    teamId: string,
    user: User
  ): Promise<Array<PatientWorkgroup.View>> {
    const workgroup = await Workgroup.findByIdAndTeam(workgroupId, teamId);
    if (!workgroup) {
      throw new ResourceNotFoundError(`Cannot find workgroup with id ${workgroupId}`);
    }
    let workgroupPatients = await PatientWorkgroup.find({
      workgroup: workgroupId
    }).populate('patient');
    if (
      user.rbacRoles &&
      user.rbacRoles.every(({ name }) =>
        [ClinicalRole.ReferringClinician, ClinicalRole.FieldSpecialist].includes(name as ClinicalRole)
      )
    ) {
      const elementMatch: ClinicalRole[] = [];
      if (user.rbacRoles.some(({ name }) => name === ClinicalRole.ReferringClinician)) {
        elementMatch.push(ClinicalRole.ReferringClinician);
      }
      if (user.rbacRoles.some(({ name }) => name === ClinicalRole.FieldSpecialist)) {
        elementMatch.push(ClinicalRole.FieldSpecialist);
      }
      // NOTE- This check is with the user Id is matched as a referring user or not
      workgroupPatients = workgroupPatients.filter((workgroupPatient) =>
        (workgroupPatient.patient as Patient.Document)?.referringUsers?.some(
          ({ name, type }) => name === String(user._id) && elementMatch.includes(type as ClinicalRole)
        )
      );
    }
    return Promise.all(
      workgroupPatients.map(async (workgroupPatient) => {
        const view = await (workgroupPatient.patient as Patient.Document).view();
        const workgroupPatientJson = workgroupPatient.view();
        workgroupPatientJson.patient = view;
        return workgroupPatientJson;
      })
    );
  }

  /**
   * Returns the workgroup patient.
   * @param workgroupPatientId the workgroup patient id
   * @param workgroupId the workgroup id
   * @param teamId  the team id
   * @param field the field to add
   */
  static async addFieldToWorkgroupPatient(
    workgroupPatientId: string,
    workgroupId: string,
    field: PatientWorkgroup.FieldInput,
    teamId: string
  ): Promise<PatientWorkgroup.Document> {
    // Load the patient workgroup.
    const workgroupPatient = await WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId,
      false
    );

    // Validates the access to the workgroup patient.
    WorkgroupService.validateWorkgroupPatientAccess(workgroupPatient as PatientWorkgroup.Document, teamId);
    const filter = await PhenotypeFieldRepository.findByFilterId(NumberUtils.castToNumberIfPossible(field.filterId));
    if (!filter) {
      throw new ResourceNotFoundError(`Cannot find filter with id ${field.filterId}.`);
    }

    if (!workgroupPatient.fields) {
      workgroupPatient.fields = [];
    }
    (workgroupPatient.fields as Array<CorePatient.PatientWorkgroupField>).push({
      filterId: field.filterId,
      instance: field.instance,
      array: field.array,
      userAdded: true
    });
    ((await workgroupPatient) as PatientWorkgroup.Document).save();
    return WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId
    ) as Promise<PatientWorkgroup.Document>;
  }

  /**
   * Removes the filter from the workgroup patient.
   * @param workgroupPatientId the workgroup patient id
   * @param workgroupId the workgroup id
   * @param fieldId the field id
   * @param teamId  the team id
   */
  static async removeFieldFromWorkgroupPatient(
    workgroupId: string,
    workgroupPatientId: string,
    fieldId: Filter.FilterId,
    teamId: string
  ): Promise<PatientWorkgroup.View> {
    // Load the patient workgroup.
    const workgroupPatient = (await WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId,
      false
    )) as PatientWorkgroup.Document;
    const filter = await PhenotypeFieldRepository.findByFilterId(fieldId);
    if (!filter) {
      throw new ResourceNotFoundError(`Cannot find filter with id ${fieldId}`);
    }
    if (!workgroupPatient.fields) {
      workgroupPatient.fields = [];
    }
    // Remove the filter to the patient and return the response
    const toRemove = workgroupPatient.fields.filter(
      (item) => item.userAdded && item.filterId.toString() === fieldId.toString()
    );
    toRemove.forEach((item) => {
      (workgroupPatient.fields as Types.DocumentArray<any>).pull(item);
    });
    await workgroupPatient.save();
    return WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId
    ) as Promise<PatientWorkgroup.View>;
  }

  /**
   * Validates the patient in workgroup. This is used typically when we want to create this patient,
   * @param workgroupName the workgroup name
   * @param patientId the patient id
   * @param teamId  the team id
   */
  static async validatePatientInWorkgroup(
    workgroupName: string,
    patientId: string,
    teamId: string
  ): Promise<{
    isValid: boolean;
    message?: string;
  }> {
    try {
      await PatientService.validateCreatePatient(patientId, workgroupName, teamId);
      return {
        isValid: true,
        message: undefined
      };
    } catch (error) {
      if (error instanceof IllegalArgumentError) {
        return {
          isValid: false,
          message: error.message
        };
      }
      throw error;
    }
  }

  /**
   * Returns the workgroup patient.
   * @param workgroupPatientId the workgroup patient id
   * @param workgroupId the workgroup id
   * @param fieldId the field id
   * @param teamId  the team id
   */
  static async addComparisonFilterToPatient(
    workgroupId: string,
    workgroupPatientId: string,
    fieldId: Filter.FilterId,
    teamId: string
  ): Promise<PatientWorkgroup.View> {
    // Load the patient workgroup.
    const workgroupPatient = (await WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId,
      false
    )) as PatientWorkgroup.Document;
    // Add the filter to the patient and return the response
    await IndividualComparisonService.addComparisonFilterToThePatient(fieldId, workgroupPatient);
    return WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId
    ) as Promise<PatientWorkgroup.View>;
  }

  /**
   * Returns the workgroup patient.
   * @param workgroupPatientId the workgroup patient id
   * @param workgroupId the workgroup id
   * @param fieldId the field id
   * @param teamId  the team id
   */
  static async removeComparisonFilterFromPatient(
    workgroupId: string,
    workgroupPatientId: string,
    fieldId: Filter.FilterId,
    teamId: string
  ): Promise<PatientWorkgroup.View> {
    // Load the patient workgroup.
    const workgroupPatient = (await WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId,
      false
    )) as PatientWorkgroup.Document;
    // Remove the filter to the patient and return the response
    await IndividualComparisonService.removeComparisonFilterToThePatient(fieldId, workgroupPatient);
    return WorkgroupService.getWorkgroupPatientById(
      workgroupPatientId,
      workgroupId,
      teamId
    ) as Promise<PatientWorkgroup.View>;
  }
}
