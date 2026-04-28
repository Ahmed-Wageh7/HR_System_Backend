import test from 'node:test';
import assert from 'node:assert/strict';
import validation from '../../src/modules/v1/auth/auth.validation.js';

test('accepts a strong signup password', () => {
  const { error } = validation.signupSchema.validate({
    name: 'Ahmed',
    email: 'ahmed@example.com',
    password: 'Welcome123'
  });

  assert.equal(error, undefined);
});

test('rejects a weak signup password', () => {
  const { error } = validation.signupSchema.validate({
    name: 'Ahmed',
    email: 'ahmed@example.com',
    password: 'weakpass'
  });

  assert.notEqual(error, undefined);
});
