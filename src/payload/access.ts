import type { Access, FieldAccess } from 'payload';

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin';
};

export const isAdminField: FieldAccess = ({ req: { user } }) => {
  return user?.role === 'admin';
};

export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (user?.role === 'admin') return true;
  return user?.id === id;
};

export const isPublic: Access = () => true;
