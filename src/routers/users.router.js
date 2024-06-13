import express from 'express';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository.js';
import { UserService } from '../services/user.service.js';
import { UserController } from '../controllers/user.controller.js';
import { authenticateRefreshToken } from '../middlewares/require-refresh-token.middleware.js';

const router = express.Router();

// 의존성 주입을 위한 인스턴스 생성
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("/sign-up", userController.signUp);
router.post('/sign-in', userController.signIn);
router.post('/token', authenticateRefreshToken, userController.refreshToken);
router.post('/logout', authenticateRefreshToken, userController.logout);

export default router;
