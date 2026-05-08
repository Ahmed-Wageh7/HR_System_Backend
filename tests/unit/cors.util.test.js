import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAllowedOrigins,
  DEFAULT_ALLOWED_ORIGINS,
  isOriginAllowed,
  normalizeOrigin,
  parseAllowedOrigins
} from '../../src/utils/cors.js';

test('normalizeOrigin trims whitespace and trailing slashes', () => {
  assert.equal(
    normalizeOrigin(' https://hr-system-frontend-three.vercel.app/ '),
    'https://hr-system-frontend-three.vercel.app'
  );
});

test('normalizeOrigin lowercases host and scheme', () => {
  assert.equal(
    normalizeOrigin('HTTPS://HR-SYSTEM-FRONTEND-THREE.VERCEL.APP'),
    'https://hr-system-frontend-three.vercel.app'
  );
});

test('parseAllowedOrigins returns normalized origin values', () => {
  assert.deepEqual(parseAllowedOrigins(' http://localhost:4200/, https://hr-system-frontend-*.vercel.app '), [
    'http://localhost:4200',
    'https://hr-system-frontend-*.vercel.app'
  ]);
});

test('buildAllowedOrigins merges defaults with configured origins without duplicates', () => {
  const allowedOrigins = buildAllowedOrigins([
    'https://hr-system-frontend-three.vercel.app',
    'https://custom-frontend.example.com'
  ]);

  assert.equal(
    allowedOrigins.includes('https://custom-frontend.example.com'),
    true
  );
  assert.equal(
    allowedOrigins.includes('https://hr-system-frontend-three.vercel.app'),
    true
  );
  assert.equal(
    allowedOrigins.filter((origin) => origin === 'https://hr-system-frontend-three.vercel.app').length,
    1
  );
  assert.equal(
    DEFAULT_ALLOWED_ORIGINS.every((origin) => allowedOrigins.includes(origin)),
    true
  );
});

test('isOriginAllowed matches exact origins', () => {
  assert.equal(
    isOriginAllowed('https://hr-system-frontend-three.vercel.app', [
      'https://hr-system-frontend-three.vercel.app'
    ]),
    true
  );
});

test('isOriginAllowed matches wildcard Vercel origins', () => {
  assert.equal(
    isOriginAllowed('https://hr-system-frontend-jxee4fr0r-ahmed-wageh7s-projects.vercel.app', [
      'https://hr-system-frontend-*.vercel.app'
    ]),
    true
  );
});

test('isOriginAllowed rejects unknown origins', () => {
  assert.equal(
    isOriginAllowed('https://another-project.vercel.app', [
      'https://hr-system-frontend-*.vercel.app'
    ]),
    false
  );
});
