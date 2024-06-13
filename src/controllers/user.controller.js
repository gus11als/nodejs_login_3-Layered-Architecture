export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  signUp = async (req, res, next) => {
    try {
      const { email, password, confirmPassword, name } = req.body;
      const newUser = await this.userService.signUp(email, password, confirmPassword, name);
      res.status(201).json({
        status: 201,
        message: "회원가입에 성공했습니다.",
        data: newUser,
      });
    } catch (err) {
      next(err);
    }
  };

  signIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const tokens = await this.userService.signIn(email, password);
      res.status(200).json({
        status: 200,
        message: '로그인에 성공했습니다.',
        data: tokens,
      });
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const user = req.user;
      const tokens = await this.userService.refreshToken(user);
      res.status(200).json({
        data: tokens,
      });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      const user = req.user;
      await this.userService.logout(user);
      res.status(200).json({
        message: '성공적으로 로그아웃되었습니다.',
        data: {
          userId: user.userId,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
