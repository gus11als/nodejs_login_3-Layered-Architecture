export class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findUserByEmail = async (email) => {
    return await this.prisma.users.findFirst({
      where: { email },
    });
  };

  createUser = async (email, password, name) => {
    return await this.prisma.users.create({
      data: {
        email,
        password,
        name,
      },
    });
  };

  saveOrUpdateRefreshToken = async (userId, token) => {
    const existingToken = await this.prisma.refreshToken.findFirst({
      where: { userId },
    });

    if (existingToken) {
      await this.prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: { token },
      });
    } else {
      await this.prisma.refreshToken.create({
        data: {
          userId,
          token,
        },
      });
    }
  };

  deleteRefreshTokens = async (userId) => {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  };
}
