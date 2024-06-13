export class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  getUserInfo = async (user) => {
    const { userId, email, name, role, createdAt, updatedAt } = user;
    return { userId, email, name, role, createdAt, updatedAt };
  };
}
