import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { AuthRepository } from '../../../src/repositories/auth.repository.js';
import { dummyUsers } from '../../dummies/users.dummy.js';

// Mock PrismaClient
const mockPrisma = {};

// AuthRepository 인스턴스 생성
const authRepository = new AuthRepository(mockPrisma);

describe('AuthRepository Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  test('유저 확인', async () => {
    // GIVEN
    const user = dummyUsers[1];
    const expectedUserInfo = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // WHEN
    const userInfo = await authRepository.getUserInfo(user);

    // THEN
    expect(userInfo).toEqual(expectedUserInfo);
  });
});
