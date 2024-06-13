export class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  getUserInfo = async (user) => {
    return this.authRepository.getUserInfo(user);
  };
}