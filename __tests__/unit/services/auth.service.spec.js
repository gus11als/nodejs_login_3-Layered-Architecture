import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../../../src/services/auth.service.js';
import { dummyUsers } from '../../dummies/users.dummy.js';

// Mock AuthRepository
const mockAuthRepository = {
  getUserInfo: jest.fn(),
};

// AuthService 인스턴스 생성
const authService = new AuthService(mockAuthRepository);

describe('AuthService Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  test('유저 조회', async () => {
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

    mockAuthRepository.getUserInfo.mockResolvedValue(expectedUserInfo);

    // WHEN
    const userInfo = await authService.getUserInfo(user);

    // THEN
    expect(mockAuthRepository.getUserInfo).toHaveBeenCalledWith(user);
    expect(userInfo).toEqual(expectedUserInfo);
  });
});
