import crypto from 'crypto';

export const randomToken = () => crypto.randomBytes(32).toString('hex');
export const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');
