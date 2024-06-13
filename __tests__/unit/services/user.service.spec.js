import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserService } from '../../../src/services/user.service.js';
import { dummyUsers } from '../../dummies/users.dummy.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtRefresh = process.env.JWT_REFRESH;
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);

// Mock UserRepository
const mockUserRepository = {
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  saveOrUpdateRefreshToken: jest.fn(),
  deleteRefreshTokens: jest.fn(),
};

const userService = new UserService(mockUserRepository);

describe('UserService Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  test('회원가입 - 성공', async () => {
    const { email, password, name } = dummyUsers[0];
    const confirmPassword = password;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    mockUserRepository.findUserByEmail.mockResolvedValue(null);
    mockUserRepository.createUser.mockResolvedValue({
      userId: 1,
      email,
      name,
      role: 'APPLICANT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

    const newUser = await userService.signUp(email, password, confirmPassword, name);

    expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(email);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith(email, hashedPassword, name);
    expect(newUser).toEqual({
      id: 1,
      email,
      name,
      role: 'APPLICANT',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  test('회원가입 - 이미 존재하는 이메일', async () => {
    const { email, password, name } = dummyUsers[0];
    const confirmPassword = password;

    mockUserRepository.findUserByEmail.mockResolvedValue(dummyUsers[1]);

    await expect(userService.signUp(email, password, confirmPassword, name)).rejects.toThrow('이미 가입된 사용자입니다.');
  });

  test('로그인 - 성공', async () => {
    const { email, password } = dummyUsers[1];
    const user = dummyUsers[1];
    const isPasswordValid = true;
    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);

    mockUserRepository.findUserByEmail.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(isPasswordValid);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedRefreshToken);
    jest.spyOn(jwt, 'sign').mockImplementation((payload, secret, options) => {
      return secret === jwtSecret ? accessToken : refreshToken;
    });

    const tokens = await userService.signIn(email, password);

    expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(email);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(mockUserRepository.saveOrUpdateRefreshToken).toHaveBeenCalledWith(user.userId, hashedRefreshToken);
    expect(tokens).toEqual({ accessToken, refreshToken });
  });

  test('로그인 - 존재하지 않는 이메일', async () => {
    const { email, password } = dummyUsers[1];

    mockUserRepository.findUserByEmail.mockResolvedValue(null);

    await expect(userService.signIn(email, password)).rejects.toThrow('존재하지 않는 이메일입니다.');
  });

  test('토큰 재발급 - 성공', async () => {
    const user = dummyUsers[1];
    const accessToken = 'newAccessToken';
    const refreshToken = 'newRefreshToken';
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);

    jest.spyOn(jwt, 'sign').mockImplementation((payload, secret, options) => {
      return secret === jwtSecret ? accessToken : refreshToken;
    });
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedRefreshToken);

    const tokens = await userService.refreshToken(user);

    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(mockUserRepository.saveOrUpdateRefreshToken).toHaveBeenCalledWith(user.userId, hashedRefreshToken);
    expect(tokens).toEqual({ accessToken, refreshToken });
  });

  test('로그아웃- 성공', async () => {
    const user = dummyUsers[1];

    await userService.logout(user);

    expect(mockUserRepository.deleteRefreshTokens).toHaveBeenCalledWith(user.userId);
  });
});
