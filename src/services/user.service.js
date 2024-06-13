// user.service.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../errors/http.error.js';
import dotenv from 'dotenv';
import { REQUIRED_FIELDS_SIGNUP, REQUIRED_FIELDS_SIGNIN, EMAIL_REGEX, PASSWORD_MIN_LENGTH } from '../constants/users.constants.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtRefresh = process.env.JWT_REFRESH;
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  signUp = async (email, password, confirmPassword, name) => {
    const missingFields = REQUIRED_FIELDS_SIGNUP.filter(field => !email || !password || !confirmPassword || !name);
    if (missingFields.length > 0) {
      throw new HttpError.BadRequest(`${missingFields.join(", ")} 를 입력해주세요`);
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new HttpError.BadRequest("이메일 형식이 옳바르지 않습니다.");
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      throw new HttpError.BadRequest(`비밀번호는 ${PASSWORD_MIN_LENGTH}자리 이상이어야 합니다.`);
    }

    if (password !== confirmPassword) {
      throw new HttpError.BadRequest("입력한 두 비밀번호가 일치하지 않습니다.");
    }

    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      console.log('이미 가입된 사용자입니다.');  // 디버그 로그 추가
      throw new HttpError.BadRequest("이미 가입된 사용자입니다.");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await this.userRepository.createUser(email, hashedPassword, name);

    return {
      id: newUser.userId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  };

  signIn = async (email, password) => {
    const missingFields = REQUIRED_FIELDS_SIGNIN.filter(field => !email || !password);
    if (missingFields.length > 0) {
      throw new HttpError.BadRequest(`${missingFields.join(', ')} 를 입력해주세요`);
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new HttpError.BadRequest('이메일 형식이 올바르지 않습니다.');
    }

    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      console.log('존재하지 않는 이메일입니다.');  // 디버그 로그 추가
      throw new HttpError.Unauthorized('존재하지 않는 이메일입니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError.Unauthorized('비밀번호가 일치하지 않습니다.');
    }

    const accessToken = jwt.sign({ userId: user.userId }, jwtSecret, { expiresIn: '12h' });
    const refreshToken = jwt.sign({ userId: user.userId }, jwtRefresh, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);
    await this.userRepository.saveOrUpdateRefreshToken(user.userId, hashedRefreshToken);

    return { accessToken, refreshToken };
  };

  refreshToken = async (user) => {
    const newAccessToken = jwt.sign({ userId: user.userId }, jwtSecret, { expiresIn: '12h' });
    const newRefreshToken = jwt.sign({ userId: user.userId }, jwtRefresh, { expiresIn: '7d' });

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, saltRounds);
    await this.userRepository.saveOrUpdateRefreshToken(user.userId, hashedNewRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  };

  logout = async (user) => {
    await this.userRepository.deleteRefreshTokens(user.userId);
  };
}
