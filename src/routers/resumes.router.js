import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ResumeRepository } from '../repositories/resume.repository.js';
import { ResumeService } from '../services/resume.service.js';
import { ResumeController } from '../controllers/resume.controller.js';
import { authenticateToken } from '../middlewares/require-access-token.middleware.js';
import { requireRoles } from '../middlewares/require-roles.middleware.js';
import { RESUME_ROUTES } from '../constants/resume.constants.js';

const router = express.Router();

// 의존성 주입을 위한 인스턴스 생성
const prisma = new PrismaClient();
const resumeRepository = new ResumeRepository(prisma);
const resumeService = new ResumeService(resumeRepository);
const resumeController = new ResumeController(resumeService);

router.post(RESUME_ROUTES.CREATE, authenticateToken, resumeController.createResume);
router.get(RESUME_ROUTES.LIST, authenticateToken, resumeController.getResumes);
router.get(RESUME_ROUTES.DETAILS, authenticateToken, resumeController.getResumeById);
router.patch(RESUME_ROUTES.UPDATE, authenticateToken, resumeController.updateResume);
router.delete(RESUME_ROUTES.DELETE, authenticateToken, resumeController.deleteResume);
router.patch(RESUME_ROUTES.UPDATE_STATUS, authenticateToken, requireRoles(['RECRUITER']), resumeController.updateResumeStatus);
router.get(RESUME_ROUTES.LOGS, authenticateToken, requireRoles(['RECRUITER']), resumeController.getResumeLogs);

export default router;
