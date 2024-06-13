import { HttpError } from '../errors/http.error.js';
import { REQUIRED_FIELDS, MIN_INTRODUCTION_LENGTH, SORT_OPTIONS, VALID_STATUSES } from '../constants/resume.constants.js';

export class ResumeService {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  createResume = async (userId, title, introduction) => {
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!introduction) missingFields.push('introduction');

    if (missingFields.length > 0) {
      throw new HttpError.BadRequest(`${missingFields.join(", ")} 를 입력해주세요`);
    }

    if (introduction.length < MIN_INTRODUCTION_LENGTH) {
      throw new HttpError.BadRequest(`자기소개는 ${MIN_INTRODUCTION_LENGTH}자 이상 작성해야 합니다.`);
    }

    const newResume = await this.resumeRepository.createResume(userId, title, introduction);
    return newResume;
  };

  getResumes = async (userId, role, sort, status) => {
    const sortOption = sort ? sort.toUpperCase() : 'DESC';
    const statusOption = status ? status.toUpperCase() : undefined;

    if (!SORT_OPTIONS.includes(sortOption)) {
      throw new HttpError.BadRequest('정렬 조건이 올바르지 않습니다. ASC 또는 DESC를 사용하세요.');
    }

    if (statusOption && !VALID_STATUSES.includes(statusOption)) {
      throw new HttpError.BadRequest('지원 상태 조건이 올바르지 않습니다.');
    }

    const resumes = await this.resumeRepository.getResumes(userId, role, sortOption, statusOption);
    return resumes;
  };

  getResumeById = async (userId, role, userResumeId) => {
    const resume = await this.resumeRepository.getResumeById(userId, role, userResumeId);
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }
    return resume;
  };

  updateResume = async (userId, userResumeId, title, introduction) => {
    if (!title && !introduction) {
      throw new HttpError.BadRequest('수정 할 정보를 입력해 주세요.');
    }

    if (introduction && introduction.length < MIN_INTRODUCTION_LENGTH) {
      throw new HttpError.BadRequest(`자기소개는 ${MIN_INTRODUCTION_LENGTH}자 이상 작성해야 합니다.`);
    }

    const updatedResume = await this.resumeRepository.updateResume(userId, userResumeId, title, introduction);
    if (!updatedResume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }
    return updatedResume;
  };

  deleteResume = async (userId, userResumeId) => {
    const resume = await this.resumeRepository.getResumeById(userId, 'USER', userResumeId);
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }
    await this.resumeRepository.deleteResume(resume.resumeId);
  };

  updateResumeStatus = async (userId, resumeId, status, reason) => {
    if (!status) {
      throw new HttpError.BadRequest('변경하고자 하는 지원 상태를 입력해 주세요.');
    }

    if (!reason) {
      throw new HttpError.BadRequest('지원 상태 변경 사유를 입력해 주세요.');
    }

    const statusOption = status.toUpperCase();
    if (!VALID_STATUSES.includes(statusOption)) {
      throw new HttpError.BadRequest('유효하지 않은 지원 상태입니다.');
    }

    const resume = await this.resumeRepository.getResumeById(userId, 'RECRUITER', resumeId);
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }

    const previousStatus = resume.status;
    const resumeLog = await this.resumeRepository.updateResumeStatus(resumeId, userId, statusOption, previousStatus, reason);
    return resumeLog;
  };

  getResumeLogs = async (resumeId) => {
    const logs = await this.resumeRepository.getResumeLogs(resumeId);
    return logs;
  };
}
