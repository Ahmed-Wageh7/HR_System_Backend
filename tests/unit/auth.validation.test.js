import validation from '../../src/modules/v1/auth/auth.validation.js';

describe('Auth validation', () => {
  it('accepts a strong signup password', () => {
    const { error } = validation.signupSchema.validate({
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Welcome123'
    });

    expect(error).toBeUndefined();
  });

  it('rejects a weak signup password', () => {
    const { error } = validation.signupSchema.validate({
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'weakpass'
    });

    expect(error).toBeDefined();
  });
});
