import { RolesRoutes } from '@core/enums';
import { WorkgroupService } from '@core/modules';
import { ifTeamSpecifiedDo, rbac, auth, getTeamAndTeamMembershipAndCheckTheyAreActive } from 'api/middlewares';
import { HttpMethods, HttpStatusCodes } from 'enums';
import { auditTrail } from 'services/auditTrail';
import { PatientService } from 'services/patient';
import { NumberUtils } from 'utils';

interface SearchRequestBody {
  criteria: Filter.SearchItem[];
}

const createWorkgroupHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team, user }: App.AuthenticatedCloudOs
) => {
  const name = c.request.body.name as string;
  const workgroup: Workgroup.Document = await WorkgroupService.createWorkgroup(name, team, user);
  c.status = HttpStatusCodes.OK;
  c.body = workgroup;
};

const deleteWorkgroupHandler: App.EndpointOperation = async (c: Koa.ParameterizedContext<App.State, App.Context>) => {
  const workgroupId = c.params?.id;
  const { teamId } = c.request.query;

  await WorkgroupService.deleteWorkgroup(workgroupId as string, teamId as string);
  c.status = HttpStatusCodes.OK;
  c.body = {};
};

const searchWorkgroupHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context<SearchRequestBody>>,
  { user }: App.AuthenticatedCloudOs
) => {
  const { criteria } = c.request.body;
  const { teamId } = c.request.query;
  const { pageNumber, pageSize, sortBy, sortType } = c.request.query;

  const workgroupsData = await WorkgroupService.searchWorkgroups(criteria, teamId as string, user, {
    pageNumber: parseInt(pageNumber as string),
    pageSize: parseInt(pageSize as string),
    sortBy: sortBy as string,
    sortByType: sortType as string
  });
  c.status = HttpStatusCodes.OK;
  c.body = workgroupsData;
};

const createWorkgroupPatientHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { user, team }: App.AuthenticatedCloudOs
) => {
  const input = c.request.body;
  const patient = await PatientService.createPatient(input, user, team);
  c.status = HttpStatusCodes.OK;
  c.body = patient;
};

const getWorkgroupSuggestionsHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team }: App.AuthenticatedCloudOs
) => {
  const { term }: { term?: string } = c.request.query;
  const workgroups = await WorkgroupService.getWorkgroupSuggestions(String(team._id), term);
  c.status = HttpStatusCodes.OK;
  c.body = workgroups;
};

const deleteWorkgroupPatientHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team }: App.AuthenticatedCloudOs
) => {
  const workgroupId = c.params?.id;
  const patientId = c.params?.pId;
  const workgroup = await WorkgroupService.deleteWorkgroupPatient(`${workgroupId}`, `${patientId}`, String(team._id));
  c.status = HttpStatusCodes.OK;
  c.body = workgroup;
};

const getWorkgroupPatientHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team }: App.AuthenticatedCloudOs
) => {
  const workgroupPatientId = c.params?.pId;
  const workgroupId = c.params?.id;
  const workgroupPatient = await WorkgroupService.getWorkgroupPatientById(
    `${workgroupPatientId}`,
    `${workgroupId}`,
    String(team._id)
  );
  c.status = HttpStatusCodes.OK;
  c.body = workgroupPatient;
};

const saveWorkgroupPatientMarkersHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context<{ markers: string[] }>>,
  { team }: App.AuthenticatedCloudOs
) => {
  const workgroupPatientId = c.params?.pId as string;
  const workgroupId = c.params?.id as string;
  const { markers } = c.request.body;
  const workgroupPatient = await WorkgroupService.saveWorkgroupPatientMarkers(
    workgroupPatientId,
    workgroupId,
    String(team._id),
    markers
  );
  c.status = HttpStatusCodes.OK;
  c.body = workgroupPatient;
};

const getWorkgroupPatientsHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team, user }: App.AuthenticatedCloudOs
) => {
  const workgroupId = c.params?.id as string;
  const workgroupPatients = await WorkgroupService.getWorkgroupPatients(workgroupId, String(team._id), user);
  c.status = HttpStatusCodes.OK;
  c.body = workgroupPatients;
};

const addFieldToWorkgroupPatientHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context<PatientWorkgroup.FieldInput>>,
  { team }: App.AuthenticatedCloudOs
) => {
  const workgroupPatientId = c.params?.pId as string;
  const workgroupId = c.params?.id as string;
  const { filterId, instance, array } = c.request.body;
  const workgroupPatient = await WorkgroupService.addFieldToWorkgroupPatient(
    workgroupPatientId,
    workgroupId,
    { filterId, instance, array },
    String(team._id)
  );
  c.status = HttpStatusCodes.OK;
  c.body = workgroupPatient;
};

const removeFieldFromWorkgroupPatientHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team }: App.AuthenticatedCloudOs
) => {
  const workgroupPatientId = c.params?.pId as string;
  const workgroupId = c.params?.id as string;
  const fieldId = c.params?.fieldId as string;
  const fieldIdNum = NumberUtils.castToNumberIfPossible(fieldId);
  const workgroupPatient = await WorkgroupService.removeFieldFromWorkgroupPatient(
    workgroupId,
    workgroupPatientId,
    fieldIdNum,
    String(team._id)
  );
  c.status = HttpStatusCodes.OK;
  c.body = workgroupPatient;
};

const validatePatientInWorkgroupHandler: App.EndpointOperation = async (
  c: Koa.ParameterizedContext<App.State, App.Context>,
  { team }: App.AuthenticatedCloudOs
) => {
  const { workgroupName }: { workgroupName?: string } = c.request.body;
  const { patientId }: { patientId?: string } = c.request.body;
  const response = await WorkgroupService.validatePatientInWorkgroup(
    `${workgroupName}`,
    `${patientId}`,
    String(team._id)
  );
  c.status = HttpStatusCodes.OK;
  c.body = response;
};

export const workgroupRoutes: App.EndpointsInfo = {
  createWorkgroup: {
    method: HttpMethods.Post,
    path: '/individual-browser/workgroup',
    operation: createWorkgroupHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroup),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  deleteWorkgroup: {
    method: HttpMethods.Delete,
    path: '/individual-browser/workgroup/:id',
    operation: deleteWorkgroupHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroup),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  searchWorkgroups: {
    method: HttpMethods.Post,
    path: '/individual-browser/workgroup/search',
    operation: searchWorkgroupHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupSearch),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  createWorkgroupPatient: {
    method: HttpMethods.Post,
    path: '/individual-browser/workgroup/patient',
    operation: createWorkgroupPatientHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupPatient),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  getWorkgroupSuggestions: {
    method: HttpMethods.Get,
    path: '/individual-browser/workgroup/suggestions',
    operation: getWorkgroupSuggestionsHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupSuggestions),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  deleteWorkgroupPatient: {
    method: HttpMethods.Delete,
    path: '/individual-browser/workgroup/:id/patient/:pId',
    operation: deleteWorkgroupPatientHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupPatient),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  getWorkgroupPatient: {
    method: HttpMethods.Get,
    path: '/individual-browser/workgroup/:id/patient/:pId',
    operation: getWorkgroupPatientHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserPatient),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  saveWorkgroupPatientMarkers: {
    method: HttpMethods.Post,
    path: '/individual-browser/workgroup/:id/patient/:pId/save-marker',
    operation: saveWorkgroupPatientMarkersHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkgroupPatientSaveMarker),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  getWorkgroupPatients: {
    method: HttpMethods.Get,
    path: '/individual-browser/workgroup/:id/patients',
    operation: getWorkgroupPatientsHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupPatients),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  addFieldToWorkgroupPatient: {
    method: HttpMethods.Post,
    path: '/individual-browser/workgroup/:id/patient/:pId/field',
    operation: addFieldToWorkgroupPatientHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupPatientsField),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  removeFieldFromWorkgroupPatient: {
    method: HttpMethods.Delete,
    path: '/individual-browser/workgroup/:id/patient/:pId/field/:fieldId',
    operation: removeFieldFromWorkgroupPatientHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupPatientsField),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  validatePatientInWorkgroup: {
    method: HttpMethods.Post,
    path: '/individual-browser/workgroup/patient/validate',
    operation: validatePatientInWorkgroupHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserWorkGroupPatientValidate),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  }
};
