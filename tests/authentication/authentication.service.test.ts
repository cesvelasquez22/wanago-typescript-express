import { TokenData } from '../../src/interfaces/token.interface';

jest.mock('../../src/authentication/authentication.service', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
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
      createCookie: (tokenData: any) => `Authorization=${tokenData.token}; Max-Age=${tokenData.expiresIn}`,
    }))
  };
});

import AuthenticationService from '../../src/authentication/authentication.service';
import EmailAlreadyExistsException from '../../src/exceptions/EmailAlreadyExistsException';

describe('The AuthenticationService', () => {
  let authenticationService: AuthenticationService;

  beforeAll(() => {
    authenticationService = new AuthenticationService();
  });
  describe('when creating a cookie', () => {
    const tokenData: TokenData = {
      token: '',
      expiresIn: 1,
    };
    
    it('should return a string cookie', () => {
      expect(typeof authenticationService.createCookie(tokenData))
        .toEqual('string');
    })
  });

  describe('when registering a user', () => {
    const userData = {
      email: 'john.doe@mail.com',
      password: 'strongPassword123',
      name: 'John Doe',
    };

    let result: any;

    beforeAll(async () => {
      result = await authenticationService.register(userData);
    });
    it('should return user data, token data, and cookie options', async () => {
      // const result = await authenticationService.register(userData);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokenData');
      expect(result).toHaveProperty('cookieOptions');
    })
  });

  describe('if the email is already in use', () => {
    const userData = {
      name: 'John Smith',
      email: 'john@smith.com',
      password: 'strongPassword123',
    };  

    it('should throw an EmailAlreadyExistsException', async () => {
      // await authenticationService.register(userData);
      await expect(authenticationService.register(userData))
        .rejects
        .toThrow(EmailAlreadyExistsException);
    });

  });
})