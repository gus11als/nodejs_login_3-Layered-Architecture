import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ResumeController } from '../../../src/controllers/resume.controller.js';
import { dummyUsers } from '../../dummies/users.dummy.js';
import { dummyResumes } from '../../dummies/resumes.dummy.js';

// Mock ResumeService
const mockResumeService = {
  createResume: jest.fn(),
  getResumes: jest.fn(),
  getResumeById: jest.fn(),
  updateResume: jest.fn(),
  deleteResume: jest.fn(),
  updateResumeStatus: jest.fn(),
  getResumeLogs: jest.fn(),
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

const resumeController = new ResumeController(mockResumeService);

describe('ResumeController Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야 합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });

  test('이력서 생성', async () => {
    // GIVEN
    const req = {
      user: dummyUsers[1],
      body: {
        title: dummyResumes[0].title,
        introduction: dummyResumes[0].introduction,
      },
    };
    const res = mockResponse;
    const next = mockNext;
    const newResume = dummyResumes[1];

    mockResumeService.createResume.mockResolvedValue(newResume);

    // WHEN
    await resumeController.createResume(req, res, next);

    // THEN
    expect(mockResumeService.createResume).toHaveBeenCalledWith(req.user.userId, req.body.title, req.body.introduction);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newResume);
  });

  test('이력서 조회', async () => {
    // GIVEN
    const req = {
      user: dummyUsers[1],
      query: {
        sort: 'DESC',
        status: 'APPLY',
      },
    };
    const res = mockResponse;
    const next = mockNext;
    const resumes = [dummyResumes[1]];

    mockResumeService.getResumes.mockResolvedValue(resumes);

    // WHEN
    await resumeController.getResumes(req, res, next);

    // THEN
    expect(mockResumeService.getResumes).toHaveBeenCalledWith(req.user.userId, req.user.role, req.query.sort, req.query.status);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resumes);
  });

  test('이력서 상세조회', async () => {
    // GIVEN
    const req = {
      user: dummyUsers[1],
      params: {
        userResumeId: dummyResumes[1].userResumeId,
      },
    };
    const res = mockResponse;
    const next = mockNext;
    const resume = dummyResumes[1];

    mockResumeService.getResumeById.mockResolvedValue(resume);

    // WHEN
    await resumeController.getResumeById(req, res, next);

    // THEN
    expect(mockResumeService.getResumeById).toHaveBeenCalledWith(req.user.userId, req.user.role, req.params.userResumeId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resume);
  });

  test('이력서 수정', async () => {
    // GIVEN
    const req = {
      user: dummyUsers[1],
      params: {
        userResumeId: dummyResumes[1].userResumeId,
      },
      body: {
        title: '수정한 이력서제목',
        introduction: '수정한 자기소개',
      },
    };
    const res = mockResponse;
    const next = mockNext;
    const updatedResume = { ...dummyResumes[1], title: req.body.title, introduction: req.body.introduction };

    mockResumeService.updateResume.mockResolvedValue(updatedResume);

    // WHEN
    await resumeController.updateResume(req, res, next);

    // THEN
    expect(mockResumeService.updateResume).toHaveBeenCalledWith(req.user.userId, req.params.userResumeId, req.body.title, req.body.introduction);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedResume);
  });

  test('이력서 삭제', async () => {
    // GIVEN
    const req = {
      user: dummyUsers[1],
      params: {
        userResumeId: dummyResumes[1].userResumeId,
      },
    };
    const res = mockResponse;
    const next = mockNext;

    mockResumeService.deleteResume.mockResolvedValue();

    // WHEN
    await resumeController.deleteResume(req, res, next);

    // THEN
    expect(mockResumeService.deleteResume).toHaveBeenCalledWith(req.user.userId, req.params.userResumeId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: '이력서가 삭제되었습니다.' });
  });

  test('이력서 상태변경', async () => {
    // GIVEN
    const req = {
      user: dummyUsers[2],
      params: {
        resumeId: dummyResumes[1].resumeId,
      },
      body: {
        status: 'INTERVIEW1',
        reason: 'Passed initial review',
      },
    };
    const res = mockResponse;
    const next = mockNext;
    const resumeLog = {
      resumeLogId: 1,
      recruiterId: req.user.userId,
      resumeId: req.params.resumeId,
      previousStatus: dummyResumes[1].status,
      newStatus: req.body.status,
      reason: req.body.reason,
      createdAt: new Date(),
    };

    mockResumeService.updateResumeStatus.mockResolvedValue(resumeLog);

    // WHEN
    await resumeController.updateResumeStatus(req, res, next);

    // THEN
    expect(mockResumeService.updateResumeStatus).toHaveBeenCalledWith(req.user.userId, req.params.resumeId, req.body.status, req.body.reason);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resumeLog);
  });

  test('이력서 로그 목록 조회', async () => {
    // GIVEN
    const req = {
      params: {
        resumeId: dummyResumes[1].resumeId,
      },
    };
    const res = mockResponse;
    const next = mockNext;
    const resumeLogs = [{
      resumeLogId: 1,
      recruiter: { name: dummyUsers[2].name },
      resumeId: req.params.resumeId,
      previousStatus: 'APPLY',
      newStatus: 'INTERVIEW1',
      reason: 'Passed initial review',
      createdAt: new Date(),
    }];

    mockResumeService.getResumeLogs.mockResolvedValue(resumeLogs);

    // WHEN
    await resumeController.getResumeLogs(req, res, next);

    // THEN
    expect(mockResumeService.getResumeLogs).toHaveBeenCalledWith(req.params.resumeId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resumeLogs);
  });
});
