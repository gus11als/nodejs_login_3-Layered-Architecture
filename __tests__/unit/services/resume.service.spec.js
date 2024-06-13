import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ResumeService } from '../../../src/services/resume.service.js';
import { HttpError } from '../../../src/errors/http.error.js';
import { dummyUsers } from '../../dummies/users.dummy.js';
import { dummyResumes } from '../../dummies/resumes.dummy.js';
import { MIN_INTRODUCTION_LENGTH } from '../../../src/constants/resume.constants.js'; // 추가

// Mock ResumeRepository
const mockResumeRepository = {
  createResume: jest.fn(),
  getResumes: jest.fn(),
  getResumeById: jest.fn(),
  updateResume: jest.fn(),
  deleteResume: jest.fn(),
  updateResumeStatus: jest.fn(),
  getResumeLogs: jest.fn(),
};

const resumeService = new ResumeService(mockResumeRepository);

describe('ResumeService Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  test('이력서 생성 - 성공', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const title = dummyResumes[0].title;
    const introduction = dummyResumes[0].introduction;
    const newResume = dummyResumes[1];

    mockResumeRepository.createResume.mockResolvedValue(newResume);

    // WHEN
    const result = await resumeService.createResume(userId, title, introduction);

    // THEN
    expect(mockResumeRepository.createResume).toHaveBeenCalledWith(userId, title, introduction);
    expect(result).toEqual(newResume);
  });

  test('이력서 생성 - 필수 입력 누락', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const title = '';
    const introduction = dummyResumes[0].introduction;

    // WHEN & THEN
    await expect(resumeService.createResume(userId, title, introduction)).rejects.toThrow(
      new HttpError.BadRequest('title 를 입력해주세요')
    );
  });

  test('이력서 생성 - 자기소개 길이 부족', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const title = dummyResumes[0].title;
    const introduction = '짧은 자기소개';

    // WHEN & THEN
    await expect(resumeService.createResume(userId, title, introduction)).rejects.toThrow(
      new HttpError.BadRequest(`자기소개는 ${MIN_INTRODUCTION_LENGTH}자 이상 작성해야 합니다.`)
    );
  });

  test('이력서 조회 - 성공', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const role = 'USER';
    const sort = 'DESC';
    const status = 'APPLY';
    const resumes = [dummyResumes[1]];

    mockResumeRepository.getResumes.mockResolvedValue(resumes);

    // WHEN
    const result = await resumeService.getResumes(userId, role, sort, status);

    // THEN
    expect(mockResumeRepository.getResumes).toHaveBeenCalledWith(userId, role, sort, status);
    expect(result).toEqual(resumes);
  });

  test('이력서 조회 - 정렬 조건 오류', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const role = 'USER';
    const sort = 'INVALID_SORT';
    const status = 'APPLY';

    // WHEN & THEN
    await expect(resumeService.getResumes(userId, role, sort, status)).rejects.toThrow(
      new HttpError.BadRequest('정렬 조건이 올바르지 않습니다. ASC 또는 DESC를 사용하세요.')
    );
  });

  test('이력서 조회 - 지원 상태 조건 오류', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const role = 'USER';
    const sort = 'DESC';
    const status = 'INVALID_STATUS';

    // WHEN & THEN
    await expect(resumeService.getResumes(userId, role, sort, status)).rejects.toThrow(
      new HttpError.BadRequest('지원 상태 조건이 올바르지 않습니다.')
    );
  });

  test('이력서 상세조회 - 성공', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const role = 'USER';
    const userResumeId = dummyResumes[1].id;
    const resume = dummyResumes[1];

    mockResumeRepository.getResumeById.mockResolvedValue(resume);

    // WHEN
    const result = await resumeService.getResumeById(userId, role, userResumeId);

    // THEN
    expect(mockResumeRepository.getResumeById).toHaveBeenCalledWith(userId, role, userResumeId);
    expect(result).toEqual(resume);
  });

  test('이력서 상세조회 - 존재하지 않는 이력서', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const role = 'USER';
    const userResumeId = dummyResumes[1].id;

    mockResumeRepository.getResumeById.mockResolvedValue(null);

    // WHEN & THEN
    await expect(resumeService.getResumeById(userId, role, userResumeId)).rejects.toThrow(
      new HttpError.NotFound('이력서가 존재하지 않습니다.')
    );
  });

  test('이력서 수정 - 성공', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const userResumeId = dummyResumes[1].id;
    const title = 'Updated Title';
    const introduction = 'Updated Introduction which is long enough to pass the validation. '.repeat(10); // 길이를 충분히 길게 설정
    const updatedResume = { ...dummyResumes[1], title, introduction };
  
    mockResumeRepository.updateResume.mockResolvedValue(updatedResume);
  
    // WHEN
    const result = await resumeService.updateResume(userId, userResumeId, title, introduction);
  
    // THEN
    expect(mockResumeRepository.updateResume).toHaveBeenCalledWith(userId, userResumeId, title, introduction);
    expect(result).toEqual(updatedResume);
  });

  test('이력서 수정 - 수정할 정보 없음', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const userResumeId = dummyResumes[1].id;

    // WHEN & THEN
    await expect(resumeService.updateResume(userId, userResumeId, '', '')).rejects.toThrow(
      new HttpError.BadRequest('수정 할 정보를 입력해 주세요.')
    );
  });

  test('이력서 수정 - 자기소개 길이 부족', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const userResumeId = dummyResumes[1].id;
    const introduction = '짧은 자기소개';

    // WHEN & THEN
    await expect(resumeService.updateResume(userId, userResumeId, 'Updated Title', introduction)).rejects.toThrow(
      new HttpError.BadRequest(`자기소개는 ${MIN_INTRODUCTION_LENGTH}자 이상 작성해야 합니다.`)
    );
  });

  test('이력서 삭제 - 성공', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const userResumeId = dummyResumes[1].id;
    const resume = dummyResumes[1];

    mockResumeRepository.getResumeById.mockResolvedValue(resume);
    mockResumeRepository.deleteResume.mockResolvedValue();

    // WHEN
    await resumeService.deleteResume(userId, userResumeId);

    // THEN
    expect(mockResumeRepository.getResumeById).toHaveBeenCalledWith(userId, 'USER', userResumeId);
    expect(mockResumeRepository.deleteResume).toHaveBeenCalledWith(resume.resumeId);
  });

  test('이력서 삭제 - 존재하지 않는 이력서', async () => {
    // GIVEN
    const userId = dummyUsers[1].id;
    const userResumeId = dummyResumes[1].id;

    mockResumeRepository.getResumeById.mockResolvedValue(null);

    // WHEN & THEN
    await expect(resumeService.deleteResume(userId, userResumeId)).rejects.toThrow(
      new HttpError.NotFound('이력서가 존재하지 않습니다.')
    );
  });

  test('이력서 상태변경 - 성공', async () => {
    // GIVEN
    const userId = dummyUsers[2].id;
    const resumeId = dummyResumes[1].id;
    const status = 'INTERVIEW1';
    const reason = 'Passed initial review';
    const previousStatus = dummyResumes[1].status;
    const resumeLog = {
      resumeLogId: 1,
      recruiterId: userId,
      resumeId,
      previousStatus,
      newStatus: status,
      reason,
      createdAt: new Date(),
    };

    mockResumeRepository.getResumeById.mockResolvedValue(dummyResumes[1]);
    mockResumeRepository.updateResumeStatus.mockResolvedValue(resumeLog);

    // WHEN
    const result = await resumeService.updateResumeStatus(userId, resumeId, status, reason);

    // THEN
    expect(mockResumeRepository.getResumeById).toHaveBeenCalledWith(userId, 'RECRUITER', resumeId);
    expect(mockResumeRepository.updateResumeStatus).toHaveBeenCalledWith(resumeId, userId, status, previousStatus, reason);
    expect(result).toEqual(resumeLog);
  });

  test('이력서 상태변경 - 지원 상태 없음', async () => {
    // GIVEN
    const userId = dummyUsers[2].id;
    const resumeId = dummyResumes[1].id;

    // WHEN & THEN
    await expect(resumeService.updateResumeStatus(userId, resumeId, '', 'reason')).rejects.toThrow(
      new HttpError.BadRequest('변경하고자 하는 지원 상태를 입력해 주세요.')
    );
  });

  test('이력서 상태변경 - 사유 없음', async () => {
    // GIVEN
    const userId = dummyUsers[2].id;
    const resumeId = dummyResumes[1].id;

    // WHEN & THEN
    await expect(resumeService.updateResumeStatus(userId, resumeId, 'status', '')).rejects.toThrow(
      new HttpError.BadRequest('지원 상태 변경 사유를 입력해 주세요.')
    );
  });

  test('이력서 상태변경 - 유효하지 않은 상태', async () => {
    // GIVEN
    const userId = dummyUsers[2].id;
    const resumeId = dummyResumes[1].id;
    const status = 'INVALID_STATUS';
    const reason = 'reason';

    // WHEN & THEN
    await expect(resumeService.updateResumeStatus(userId, resumeId, status, reason)).rejects.toThrow(
      new HttpError.BadRequest('유효하지 않은 지원 상태입니다.')
    );
  });

  test('이력서 상태변경 - 존재하지 않는 이력서', async () => {
    // GIVEN
    const userId = dummyUsers[2].id;
    const resumeId = dummyResumes[1].id;
    const status = 'INTERVIEW1';
    const reason = 'reason';

    mockResumeRepository.getResumeById.mockResolvedValue(null);

    // WHEN & THEN
    await expect(resumeService.updateResumeStatus(userId, resumeId, status, reason)).rejects.toThrow(
      new HttpError.NotFound('이력서가 존재하지 않습니다.')
    );
  });

  test('이력서 로그조회 - 성공', async () => {
    // GIVEN
    const resumeId = dummyResumes[1].id;
    const resumeLogs = [{
      resumeLogId: 1,
      recruiter: { name: dummyUsers[2].name },
      resumeId,
      previousStatus: 'APPLY',
      newStatus: 'INTERVIEW1',
      reason: 'Passed initial review',
      createdAt: new Date(),
    }];

    mockResumeRepository.getResumeLogs.mockResolvedValue(resumeLogs);

    // WHEN
    const result = await resumeService.getResumeLogs(resumeId);

    // THEN
    expect(mockResumeRepository.getResumeLogs).toHaveBeenCalledWith(resumeId);
    expect(result).toEqual(resumeLogs);
  });
});
