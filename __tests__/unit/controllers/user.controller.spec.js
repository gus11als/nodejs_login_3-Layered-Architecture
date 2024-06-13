import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { UserController } from '../../../src/controllers/user.controller.js';
import { dummyUsers } from '../../dummies/users.dummy.js';

// Mock UserService
const mockUserService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
};

// Mock Request, Response, Next
const mockRequest = {
  user: jest.fn(),
  body: jest.fn(),
  query: jest.fn(),
  params: jest.fn(),
};

const mockResponse = {
  status: jest.fn(),
  json: jest.fn(),
};

const mockNext = jest.fn();

const userController = new UserController(mockUserService);

describe('UserController Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });

  test('회원가입', async () => {
    // GIVEN
    const req = {
      body: {
        email: dummyUsers[0].email,
        password: dummyUsers[0].password,
        confirmPassword: dummyUsers[0].password,
        name: dummyUsers[0].name,
      },
    };
    const res = mockResponse;
    const next = mockNext;

    const newUser = {
      id: 1,
      email: dummyUsers[0].email,
      name: dummyUsers[0].name,
      role: 'APPLICANT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserService.signUp.mockResolvedValue(newUser);

    // WHEN
    await userController.signUp(req, res, next);

    // THEN
    expect(mockUserService.signUp).toHaveBeenCalledWith(req.body.email, req.body.password, req.body.confirmPassword, req.body.name);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: "회원가입에 성공했습니다.",
      data: newUser,
    });
  });

  test('로그인', async () => {
    // GIVEN
    const req = {
      body: {
        email: dummyUsers[1].email,
        password: dummyUsers[1].password,
      },
    };
    const res = mockResponse;
    const next = mockNext;

    const tokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    mockUserService.signIn.mockResolvedValue(tokens);

    // WHEN
    await userController.signIn(req, res, next);

    // THEN
    expect(mockUserService.signIn).toHaveBeenCalledWith(req.body.email, req.body.password);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: '로그인에 성공했습니다.',
      data: tokens,
    });
  });

  test('토큰 재발급', async () => {
    // GIVEN
    const req = {
      user: dummyUsers[1],
    };
    const res = mockResponse;
    const next = mockNext;

    const tokens = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    };

    mockUserService.refreshToken.mockResolvedValue(tokens);

    // WHEN
    await userController.refreshToken(req, res, next);

    // THEN
    expect(mockUserService.refreshToken).toHaveBeenCalledWith(req.user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: tokens,
    });
  });

  test('로그아웃', async () => {
    // GIVEN
    const req = {
      user: dummyUsers[1],
    };
    const res = mockResponse;
    const next = mockNext;

    mockUserService.logout.mockResolvedValue();

    // WHEN
    await userController.logout(req, res, next);

    // THEN
    expect(mockUserService.logout).toHaveBeenCalledWith(req.user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: '성공적으로 로그아웃되었습니다.',
      data: {
        userId: req.user.userId,
      },
    });
  });
});
