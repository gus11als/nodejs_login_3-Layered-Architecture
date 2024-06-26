import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: '인증 정보가 없습니다.' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '지원하지 않는 인증 방식입니다.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '지원하지 않는 인증 방식입니다.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const user = await prisma.users.findUnique({
      where: { userId: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: '인증 정보와 일치하는 사용자가 없습니다.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '인증 정보가 만료되었습니다.' });
    }
    return res.status(401).json({ message: '인증 정보가 유효하지 않습니다.' });
  }
  
};