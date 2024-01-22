import config from '@appify/shared/config';

export function isProdEnv(): boolean {
   if (config.app.environment !== 'production') {
      return false;
   }
   return true;
}

export function exclude<User, Key extends keyof User>(user: User, keys: Key[]): Omit<User, Key> {
   for (const key of keys) {
      delete user[key];
   }
   return user;
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
   const result: Partial<Pick<T, K>> = {};
   for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
         result[key] = obj[key];
      }
   }
   return result as Pick<T, K>;
}
