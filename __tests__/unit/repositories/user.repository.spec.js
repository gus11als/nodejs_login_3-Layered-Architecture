import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { UserRepository } from '../../../src/repositories/user.repository.js';
import { dummyUsers } from '../../dummies/users.dummy.js';

// Mock PrismaClient
const mockPrisma = {
  users: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const userRepository = new UserRepository(mockPrisma);

describe('UserRepository Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다
  });

  test('이메일 검색', async () => {
    // GIVEN
    const email = dummyUsers[0].email;
    const expectedUser = dummyUsers[1];

    mockPrisma.users.findFirst.mockResolvedValue(expectedUser);

    // WHEN
    const user = await userRepository.findUserByEmail(email);

    // THEN
    expect(mockPrisma.users.findFirst).toHaveBeenCalledWith({ where: { email } });
    expect(user).toEqual(expectedUser);
  });

  test('유저 생성', async () => {
    // GIVEN
    const { email, password, name } = dummyUsers[0];
    const expectedUser = dummyUsers[1];

    mockPrisma.users.create.mockResolvedValue(expectedUser);

    // WHEN
    const newUser = await userRepository.createUser(email, password, name);

    // THEN
    expect(mockPrisma.users.create).toHaveBeenCalledWith({
      data: {
        email,
        password,
        name,
      },
    });
    expect(newUser).toEqual(expectedUser);
  });

  test('리프레시 토큰 업데이트', async () => {
    // GIVEN
    const userId = dummyUsers[1].userId;
    const token = 'newRefreshToken';
    const existingToken = { id: 1, userId, token: 'oldRefreshToken' };

    mockPrisma.refreshToken.findFirst.mockResolvedValue(existingToken);
    mockPrisma.refreshToken.update.mockResolvedValue({ ...existingToken, token });

    // WHEN
    await userRepository.saveOrUpdateRefreshToken(userId, token);

    // THEN
    expect(mockPrisma.refreshToken.findFirst).toHaveBeenCalledWith({ where: { userId } });
    expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: existingToken.id },
      data: { token },
    });
  });

  test('리프레시 토큰 생성', async () => {
    // GIVEN
    const userId = dummyUsers[1].userId;
    const token = 'newRefreshToken';

    mockPrisma.refreshToken.findFirst.mockResolvedValue(null);
    mockPrisma.refreshToken.create.mockResolvedValue({ userId, token });

    // WHEN
    await userRepository.saveOrUpdateRefreshToken(userId, token);

    // THEN
    expect(mockPrisma.refreshToken.findFirst).toHaveBeenCalledWith({ where: { userId } });
    expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
      data: { userId, token },
    });
  });

  test('리프레시 토큰 삭제', async () => {
    // GIVEN
    const userId = dummyUsers[1].userId;

    // WHEN
    await userRepository.deleteRefreshTokens(userId);

    // THEN
    expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId } });
  });
});
