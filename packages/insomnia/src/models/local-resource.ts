import { database as db } from '../common/database';
import { generateId } from '../common/misc';
import { type BaseModel } from './index';

export const name = 'Local Resource';
export const type = 'file';
export const prefix = 'file';
export const canDuplicate = false;
export const canSync = false;

export interface LocalResource extends BaseModel {
  path: string;
}

export function init(): Partial<LocalResource> {
  return {
    path: '~/',
  };
}

export const isProject = (model: Pick<BaseModel, 'type'>): model is LocalResource => (
  model.type === type
);

export function createId() {
  return generateId(prefix);
}

export function create(patch: Partial<LocalResource> = {}) {
  return db.docCreate<LocalResource>(type, patch);
}

export function getById(_id: string) {
  return db.getWhere<LocalResource>(type, { _id });
}

export function getByRemoteId(remoteId: string) {
  return db.getWhere<LocalResource>(type, { remoteId });
}

export function remove(project: LocalResource) {
  return db.remove(project);
}

export function update(project: LocalResource, patch: Partial<LocalResource>) {
  return db.docUpdate(project, patch);
}

export async function all() {
  const projects = await db.all<LocalResource>(type);
  return projects;
}
