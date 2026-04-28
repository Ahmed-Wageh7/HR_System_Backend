import app from '../src/app.js';
import bootstrapApp from '../src/bootstrap.js';

export default async function handler(req, res) {
  await bootstrapApp();
  return app(req, res);
}
