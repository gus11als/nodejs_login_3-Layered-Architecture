import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRepository } from '../repositories/auth.repository.js';
import { AuthService } from '../services/auth.service.js';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/require-access-token.middleware.js';
import { authenticateRefreshToken } from '../middlewares/require-refresh-token.middleware.js';

const router = express.Router();

// 의존성 주입을 위한 인스턴스 생성
const prisma = new PrismaClient();
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.get('/users', authenticateToken, authController.getUserInfo);
router.get('/users/refresh', authenticateRefreshToken, authController.refreshUserInfo);

export default router;
