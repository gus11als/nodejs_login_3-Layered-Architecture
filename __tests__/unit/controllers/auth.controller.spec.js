import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { AuthController } from '../../../src/controllers/auth.controller.js';
import { HttpError } from '../../../src/errors/http.error.js';
import { dummyUsers } from '../../dummies/users.dummy.js';

// Mock AuthService
const mockAuthService = {
  getUserInfo: jest.fn(),
};

// Mock Request, Response, Next
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

const mockNext = jest.fn();

const authController = new AuthController(mockAuthService);

describe('AuthController Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });

  test('유저조회 - 성공', async () => {
    const req = { user: dummyUsers[1] };
    const res = mockResponse;
    const next = mockNext;

    const expectedUserInfo = {
      userId: dummyUsers[1].userId, // userId가 정의되어야 합니다.
      email: dummyUsers[1].email,
      name: dummyUsers[1].name,
      role: dummyUsers[1].role,
      createdAt: dummyUsers[1].createdAt,
      updatedAt: dummyUsers[1].updatedAt,
    };

    mockAuthService.getUserInfo.mockResolvedValue(expectedUserInfo);

    await authController.getUserInfo(req, res, next);

    expect(mockAuthService.getUserInfo).toHaveBeenCalledWith(req.user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedUserInfo);
  });

  test('유저조회 - 실패', async () => {
    const req = { user: dummyUsers[1] };
    const res = mockResponse;
    const next = mockNext;

    const errorMessage = 'Internal Server Error';
    mockAuthService.getUserInfo.mockRejectedValue(new Error(errorMessage));

    await authController.getUserInfo(req, res, next);

    expect(mockAuthService.getUserInfo).toHaveBeenCalledWith(req.user);
    expect(next).toHaveBeenCalledWith(new HttpError.InternalServerError(errorMessage));
  });

  test('유저확인리프레시 - 성공', async () => {
    const req = { user: dummyUsers[1] };
    const res = mockResponse;
    const next = mockNext;

    const expectedUserInfo = {
      userId: dummyUsers[1].userId, // userId가 정의되어야 합니다.
      email: dummyUsers[1].email,
      name: dummyUsers[1].name,
      role: dummyUsers[1].role,
      createdAt: dummyUsers[1].createdAt,
      updatedAt: dummyUsers[1].updatedAt,
    };

    mockAuthService.getUserInfo.mockResolvedValue(expectedUserInfo);

    await authController.refreshUserInfo(req, res, next);

    expect(mockAuthService.getUserInfo).toHaveBeenCalledWith(req.user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedUserInfo);
  });

  test('유저확인리프레시 - 실패', async () => {
    const req = { user: dummyUsers[1] };
    const res = mockResponse;
    const next = mockNext;

    const errorMessage = 'Internal Server Error';
    mockAuthService.getUserInfo.mockRejectedValue(new Error(errorMessage));

    await authController.refreshUserInfo(req, res, next);

    expect(mockAuthService.getUserInfo).toHaveBeenCalledWith(req.user);
    expect(next).toHaveBeenCalledWith(new HttpError.InternalServerError(errorMessage));
  });
});
