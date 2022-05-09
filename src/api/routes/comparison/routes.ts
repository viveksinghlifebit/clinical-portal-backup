import { HttpMethods, HttpStatusCodes, RolesRoutes } from 'enums';
import { rbac, auth } from 'api/middlewares';
import { getTeamAndTeamMembershipAndCheckTheyAreActive, ifTeamSpecifiedDo } from 'api/middlewares/team';
import { auditTrail } from 'services/auditTrail';
import { NumberUtils } from 'utils';
import { IndividualComparisonService, WorkgroupService } from '@core/modules';

const getComparisonByFieldAndVariantHandler: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>
) => {
  const fieldId = NumberUtils.castToNumberIfPossible(ctx.params?.id as string);
  const variant = ctx.params?.variant as string;
  const excludeId = ctx.request.query.excludeEid as string;
  const data = await IndividualComparisonService.getComparisonByFieldAndVariant(fieldId, variant, excludeId);
  ctx.status = HttpStatusCodes.OK;
  ctx.body = data;
};

const getComparisonParticipantsByGeneHandler: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>
) => {
  const gene = ctx.params?.gene as string;
  const excludeId = ctx.request.query.excludeEid as string;
  const participantIds = await IndividualComparisonService.getParticipantsByGene(gene, excludeId);
  ctx.status = HttpStatusCodes.OK;
  ctx.body = {
    participants: participantIds
  };
};

const getComparisonByFieldAndGeneHandler: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>
) => {
  const fieldId = NumberUtils.castToNumberIfPossible(ctx.params?.id as string);
  const gene = ctx.params?.gene as string;
  const excludeId = ctx.request.query.excludeEid as string;
  const data = await IndividualComparisonService.getComparisonByFieldAndGene(fieldId, gene, excludeId);
  ctx.status = HttpStatusCodes.OK;
  ctx.body = data;
};

const addComparisonFilterToPatientHandler: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>,
  { team }: App.AuthenticatedCloudOs
) => {
  const { fieldId } = ctx.request.body;
  const patientId = ctx.params?.pId as string;
  const workgroupId = ctx.params?.id as string;
  const fieldIdNum = NumberUtils.castToNumberIfPossible(fieldId);
  const workgroupPatient = await WorkgroupService.addComparisonFilterToPatient(
    workgroupId,
    patientId,
    fieldIdNum,
    String(team._id)
  );
  ctx.status = HttpStatusCodes.OK;
  ctx.body = workgroupPatient;
};

const removeComparisonFilterFromPatientHandler: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>,
  { team }: App.AuthenticatedCloudOs
) => {
  const patientId = ctx.params?.pId as string;
  const workgroupId = ctx.params?.id as string;
  const fieldId = ctx.params?.fieldId as string;
  const fieldIdNum = NumberUtils.castToNumberIfPossible(fieldId);
  const workgroupPatient = await WorkgroupService.removeComparisonFilterFromPatient(
    workgroupId,
    patientId,
    fieldIdNum,
    String(team._id)
  );
  ctx.status = HttpStatusCodes.OK;
  ctx.body = workgroupPatient;
};

const getComparisonParticipantsByVariantHandler: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>
) => {
  const variant = ctx.params?.variant as string;
  const excludeId = ctx.request.query.excludeEid as string;
  const participantIds = await IndividualComparisonService.getParticipantsByVariant(variant, excludeId);
  ctx.status = HttpStatusCodes.OK;
  ctx.body = {
    participants: participantIds
  };
};

const getComparisonGraphDataByVariantHandler: App.EndpointOperation = async (
  ctx: Koa.ParameterizedContext<App.State, App.Context>
) => {
  const variant = ctx.params?.variant as string;
  const excludeId = ctx.request.query.excludeEid as string;
  const data = await IndividualComparisonService.getComparisonGraphDataByVariant(variant, excludeId);
  ctx.status = HttpStatusCodes.OK;
  ctx.body = data;
};

export const comparisonRoutes: App.EndpointsInfo = {
  getComparisonByFieldAndVariant: {
    method: HttpMethods.Get,
    path: '/individual-browser/comparison/field/:id/variant/:variant',
    operation: getComparisonByFieldAndVariantHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserComparisonFieldVariant),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  getComparisonParticipantsByVariant: {
    method: HttpMethods.Get,
    path: '/individual-browser/comparison/variant/:variant/participants',
    operation: getComparisonParticipantsByVariantHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserComparisonVariantParticipants),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  addComparisonFilterToPatient: {
    method: HttpMethods.Post,
    path: '/individual-browser/comparison/workgroup/:id/patients/:pId/field',
    operation: addComparisonFilterToPatientHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserComparisonWorkGroupPatients),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  getComparisonParticipantsByGene: {
    method: HttpMethods.Get,
    path: '/individual-browser/comparison/gene/:gene/participants',
    operation: getComparisonParticipantsByGeneHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserComparisonGeneParticipants),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  getComparisonByFieldAndGene: {
    method: HttpMethods.Get,
    path: '/individual-browser/comparison/field/:id/gene/:gene',
    operation: getComparisonByFieldAndGeneHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserComparisonFieldGene),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  removeComparisonFilterFromPatient: {
    method: HttpMethods.Delete,
    path: '/individual-browser/comparison/workgroup/:id/patients/:pId/field/:fieldId',
    operation: removeComparisonFilterFromPatientHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserComparisonWorkGroupPatientsField),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  },
  getComparisonGraphDataByVariant: {
    method: HttpMethods.Get,
    path: '/individual-browser/comparison/variant/:variant/graph',
    operation: getComparisonGraphDataByVariantHandler,
    middlewares: [
      auth(['token', 'apikey']),
      rbac(RolesRoutes.IndividualBrowserComparisonVariantGraph),
      ifTeamSpecifiedDo([getTeamAndTeamMembershipAndCheckTheyAreActive])
    ],
    postMiddlewares: [auditTrail]
  }
};
