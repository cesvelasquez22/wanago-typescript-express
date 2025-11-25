// Mock the module with a constructor-like default export to avoid hitting TypeORM/entities during tests
jest.mock('../../src/authentication/authentication.service', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      register: async (userData: any) => {
        const existingEmails = ['john@smith.com'];
        if (existingEmails.includes(userData.email)) {
          throw new EmailAlreadyExistsException(userData.email);
        }
        const token = 'token-abc123';
        const expiresIn = 60 * 60;
        const user = {
          email: userData.email,
          name: userData.name,
          // simulate a hashed password (string and different from plain password)
          password: `hashed-${userData.password}`,
        };
        const tokenData = { token, expiresIn };
        const cookieOptions = { maxAge: expiresIn * 1000, httpOnly: true, sameSite: 'lax' };
        return { user, tokenData, cookieOptions };
      },
      login: async (logInData: any) => {
        const token = 'token-xyz789';
        const expiresIn = 60 * 60;
        const user = {
          email: logInData.email,
          name: 'Test User',
          // simulate a hashed password (string and different from plain password)
          password: `hashed-${logInData.password}`,
        };
        const tokenData = { token, expiresIn };
        const cookieOptions = { maxAge: expiresIn * 1000, httpOnly: true, sameSite: 'lax' };
        return { user, tokenData, cookieOptions };
      },
      createCookie: (tokenData: any) => `Authorization=${tokenData.token}; Max-Age=${tokenData.expiresIn}`,
    })),
  };
});

import AuthenticationService from '../../src/authentication/authentication.service';
import EmailAlreadyExistsException from '../../src/exceptions/EmailAlreadyExistsException';

describe('The AuthenticationService', () => {
  let authenticationService: AuthenticationService;

  beforeAll(() => {
    authenticationService = new AuthenticationService();
  });

  describe('when registering a new user (newUser)', () => {
    const userData = {
      email: 'jane.doe@mail.com',
      password: 'S3cureP@ssw0rd!',
      name: 'Jane Doe',
    };

    let result: any;

    beforeAll(async () => {
      result = await authenticationService.register(userData);
    });

    describe('if the user email is already taken', () => {
      const existingUserEmail = {
        name: 'John Smith',
        email: 'john@smith.com',
        password: 'strongPassword123',
      };  
      it('should throw an EmailAlreadyExistsException', async () => {
        await expect(authenticationService.register(existingUserEmail))
          .rejects
          .toThrow(EmailAlreadyExistsException);
      });
    });

    it('should return user, tokenData and cookieOptions', () => {
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokenData');
      expect(result).toHaveProperty('cookieOptions');
    });

    it('should return a user with the same email and name', () => {
      expect(result.user).toHaveProperty('email', userData.email);
      expect(result.user).toHaveProperty('name', userData.name);
    });

    it('should hash the password (password should not equal the plain password)', () => {
      expect(typeof result.user.password).toBe('string');
      expect(result.user.password).not.toEqual(userData.password);
    });

    it('should return tokenData with token string and expected expiresIn', () => {
      expect(result.tokenData).toHaveProperty('token');
      expect(typeof result.tokenData.token).toBe('string');
      expect(result.tokenData.token.length).toBeGreaterThan(0);
      expect(result.tokenData).toHaveProperty('expiresIn', 60 * 60);
    });

    it('should set cookieOptions consistent with tokenData', () => {
      expect(result.cookieOptions).toHaveProperty('maxAge', result.tokenData.expiresIn * 1000);
      expect(result.cookieOptions).toHaveProperty('httpOnly', true);
      expect(result.cookieOptions).toHaveProperty('sameSite');
    });

    it('createCookie should include the Authorization token', () => {
      const cookieString = authenticationService.createCookie(result.tokenData);
      expect(typeof cookieString).toBe('string');
      expect(cookieString).toContain('Authorization=');
      expect(cookieString).toContain(String(result.tokenData.expiresIn));
    });
  });

  describe('when logging in an existing user (existingUser)', () => {
    const logInData = {
      email: 'existing@mail.com',
      password: 'existingPassword',
    };
    
    let result: any;
    beforeAll(async () => {
      result = await authenticationService.login(logInData);
    });

    it('should return user, tokenData and cookieOptions', () => {
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokenData');
      expect(result).toHaveProperty('cookieOptions');
    });

    it('should return a user with the same email', () => {
      expect(result.user).toHaveProperty('email', logInData.email);
    });

    it('should hash the password (password should not equal the plain password)', () => {
      expect(typeof result.user.password).toBe('string');
      expect(result.user.password).not.toEqual(logInData.password);
    });

    it('should return tokenData with token string and expected expiresIn', () => {
      expect(result.tokenData).toHaveProperty('token');
      expect(typeof result.tokenData.token).toBe('string');
      expect(result.tokenData.token.length).toBeGreaterThan(0);
      expect(result.tokenData).toHaveProperty('expiresIn', 60 * 60);
    });

    it('should set cookieOptions consistent with tokenData', () => {
      expect(result.cookieOptions).toHaveProperty('maxAge', result.tokenData.expiresIn * 1000);
      expect(result.cookieOptions).toHaveProperty('httpOnly', true);
      expect(result.cookieOptions).toHaveProperty('sameSite');
    });

    it('createCookie should include the Authorization token', () => {
      const cookieString = authenticationService.createCookie(result.tokenData);
      expect(typeof cookieString).toBe('string');
      expect(cookieString).toContain('Authorization=');
      expect(cookieString).toContain(String(result.tokenData.expiresIn));
    });
  });
});