import {NextResponse} from 'next/server';

export const ActionError = (status: number, statusText: string) => {
  return NextResponse.json({statusText: statusText}, {status: status});
};

export const UnauthorizedError = (text?: string) => {
  return ActionError(401, text || 'Unauthorized');
};

export const NotFoundError = (text?: string) => {
  return ActionError(404, text || 'Not Found');
};

export const ForbiddenError = (text?: string) => {
  return ActionError(403, text || 'Forbidden');
};

export const BadRequestError = (text?: string) => {
  return ActionError(400, text || 'Bad Request');
};

export const InternalServerError = (text?: string) => {
  return ActionError(500, text || 'Internal Server Error');
};

export const ConflictError = (text?: string) => {
  return ActionError(409, text || 'Conflict');
};

export const ServiceUnavailableError = (text?: string) => {
  return ActionError(503, text || 'Service Unavailable');
};
