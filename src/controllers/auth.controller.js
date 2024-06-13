import { HttpError } from '../errors/http.error.js';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  getUserInfo = async (req, res, next) => {
    try {
      const userInfo = await this.authService.getUserInfo(req.user);
      return res.status(200).json(userInfo);
    } catch (error) {
      next(new HttpError.InternalServerError(error.message));
    }
  };

  refreshUserInfo = async (req, res, next) => {
    try {
      const userInfo = await this.authService.getUserInfo(req.user);
      return res.status(200).json(userInfo);
    } catch (error) {
      next(new HttpError.InternalServerError(error.message));
    }
  };
}
