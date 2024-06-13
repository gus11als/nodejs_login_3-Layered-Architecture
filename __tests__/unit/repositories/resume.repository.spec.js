import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { ResumeRepository } from '../../../src/repositories/resume.repository.js';
import { dummyUsers } from '../../dummies/users.dummy.js';
import { dummyResumes } from '../../dummies/resumes.dummy.js';

// Mock PrismaClient
const mockPrisma = {
  resume: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  resumeLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const resumeRepository = new ResumeRepository(mockPrisma);

describe('ResumeRepository Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  test('이력서 생성', async () => {
    // GIVEN
    const userId = dummyUsers[1].userId;
    const title = dummyResumes[0].title;
    const introduction = dummyResumes[0].introduction;
    const maxUserResume = null;
    const newResume = dummyResumes[1];

    mockPrisma.resume.findFirst.mockResolvedValue(maxUserResume);
    mockPrisma.resume.create.mockResolvedValue(newResume);

    // WHEN
    const result = await resumeRepository.createResume(userId, title, introduction);

    // THEN
    expect(mockPrisma.resume.findFirst).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { userResumeId: 'desc' },
      select: { userResumeId: true },
    });
    expect(mockPrisma.resume.create).toHaveBeenCalledWith({
      data: {
        userId,
        userResumeId: 1,
        title,
        introduction,
      },
    });
    expect(result).toEqual({
      userResumeId: newResume.userResumeId,
      userId: newResume.userId,
      title: newResume.title,
      introduction: newResume.introduction,
      status: newResume.status,
      createdAt: newResume.createdAt,
      updatedAt: newResume.updatedAt,
    });
  });

  test('이력서 조회', async () => {
    // GIVEN
    const userId = dummyUsers[1].userId;
    const role = 'USER';
    const sort = 'DESC';
    const status = 'APPLY';
    const resumes = [dummyResumes[1]];

    mockPrisma.resume.findMany.mockResolvedValue(resumes);

    // WHEN
    const result = await resumeRepository.getResumes(userId, role, sort, status);

    // THEN
    expect(mockPrisma.resume.findMany).toHaveBeenCalledWith({
      where: { userId, status },
      orderBy: { createdAt: sort.toLowerCase() },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    expect(result).toEqual([{
      userResumeId: resumes[0].userResumeId,
      name: resumes[0].user.name,
      title: resumes[0].title,
      introduction: resumes[0].introduction,
      status: resumes[0].status,
      createdAt: resumes[0].createdAt,
      updatedAt: resumes[0].updatedAt,
    }]);
  });

  test('이력서 상세조회', async () => {
    // GIVEN
    const userId = dummyUsers[1].userId;
    const role = 'USER';
    const userResumeId = dummyResumes[1].userResumeId;
    const resume = dummyResumes[1];

    mockPrisma.resume.findFirst.mockResolvedValue(resume);

    // WHEN
    const result = await resumeRepository.getResumeById(userId, role, userResumeId);

    // THEN
    expect(mockPrisma.resume.findFirst).toHaveBeenCalledWith({
      where: { userResumeId: Number(userResumeId), userId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    expect(result).toEqual({
      resumeId: resume.resumeId,
      userResumeId: resume.userResumeId,
      name: resume.user.name,
      title: resume.title,
      introduction: resume.introduction,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    });
  });

  test('이력서 수정', async () => {
    // GIVEN
    const userId = dummyUsers[1].userId;
    const userResumeId = dummyResumes[1].userResumeId;
    const title = 'Updated Title';
    const introduction = 'Updated Introduction';
    const resume = dummyResumes[1];
    const updatedResume = { ...resume, title, introduction };

    mockPrisma.resume.findFirst.mockResolvedValue(resume);
    mockPrisma.resume.update.mockResolvedValue(updatedResume);

    // WHEN
    const result = await resumeRepository.updateResume(userId, userResumeId, title, introduction);

    // THEN
    expect(mockPrisma.resume.findFirst).toHaveBeenCalledWith({
      where: {
        userResumeId: Number(userResumeId),
        userId,
      },
    });
    expect(mockPrisma.resume.update).toHaveBeenCalledWith({
      where: {
        resumeId: resume.resumeId,
      },
      data: { title, introduction },
    });
    expect(result).toEqual({
      userResumeId: updatedResume.userResumeId,
      userId: updatedResume.userId,
      title: updatedResume.title,
      introduction: updatedResume.introduction,
      status: updatedResume.status,
      createdAt: updatedResume.createdAt,
      updatedAt: updatedResume.updatedAt,
    });
  });

  test('이력서 삭제', async () => {
    // GIVEN
    const resumeId = dummyResumes[1].resumeId;

    // WHEN
    await resumeRepository.deleteResume(resumeId);

    // THEN
    expect(mockPrisma.resume.delete).toHaveBeenCalledWith({ where: { resumeId } });
  });

  test('이력서 상태변경', async () => {
    // GIVEN
    const resumeId = dummyResumes[1].resumeId;
    const userId = dummyUsers[2].userId;
    const status = 'INTERVIEW1';
    const previousStatus = 'APPLY';
    const reason = 'Passed initial review';
    const updatedResume = { ...dummyResumes[1], status };
    const resumeLog = {
      resumeLogId: 1,
      recruiterId: userId,
      resumeId,
      previousStatus,
      newStatus: status,
      reason,
      createdAt: new Date(),
    };

    mockPrisma.$transaction.mockResolvedValue([updatedResume, resumeLog]);

    // WHEN
    const result = await resumeRepository.updateResumeStatus(resumeId, userId, status, previousStatus, reason);

    // THEN
    expect(mockPrisma.$transaction).toHaveBeenCalledWith([
      mockPrisma.resume.update({
        where: { resumeId: Number(resumeId) },
        data: { status },
      }),
      mockPrisma.resumeLog.create({
        data: {
          resumeId: Number(resumeId),
          recruiterId: userId,
          previousStatus,
          newStatus: status,
          reason,
        },
      }),
    ]);
    expect(result).toEqual({
      resumeLogId: resumeLog.resumeLogId,
      recruiterId: resumeLog.recruiterId,
      resumeId: resumeLog.resumeId,
      previousStatus: resumeLog.previousStatus,
      newStatus: resumeLog.newStatus,
      reason: resumeLog.reason,
      createdAt: resumeLog.createdAt,
    });
  });

  test('이력서 로그 조회', async () => {
    // GIVEN
    const resumeId = dummyResumes[1].resumeId;
    const resumeLogs = [{
      resumeLogId: 1,
      recruiter: { name: dummyUsers[2].name },
      resumeId,
      previousStatus: 'APPLY',
      newStatus: 'INTERVIEW1',
      reason: 'Passed initial review',
      createdAt: new Date(),
    }];

    mockPrisma.resumeLog.findMany.mockResolvedValue(resumeLogs);

    // WHEN
    const result = await resumeRepository.getResumeLogs(resumeId);

    // THEN
    expect(mockPrisma.resumeLog.findMany).toHaveBeenCalledWith({
      where: { resumeId: Number(resumeId) },
      orderBy: { createdAt: 'desc' },
      include: {
        recruiter: {
          select: {
            name: true,
          },
        },
      },
    });
    expect(result).toEqual([{
      resumeLogId: resumeLogs[0].resumeLogId,
      recruiterName: resumeLogs[0].recruiter.name,
      resumeId: resumeLogs[0].resumeId,
      previousStatus: resumeLogs[0].previousStatus,
      newStatus: resumeLogs[0].newStatus,
      reason: resumeLogs[0].reason,
      createdAt: resumeLogs[0].createdAt,
    }]);
  });
});
