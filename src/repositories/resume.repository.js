export class ResumeRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  createResume = async (userId, title, introduction) => {
    const maxUserResume = await this.prisma.resume.findFirst({
      where: { userId },
      orderBy: { userResumeId: 'desc' },
      select: { userResumeId: true },
    });

    const newUserResumeId = maxUserResume ? maxUserResume.userResumeId + 1 : 1;

    const newResume = await this.prisma.resume.create({
      data: {
        userId,
        userResumeId: newUserResumeId,
        title,
        introduction,
      },
    });

    return {
      userResumeId: newResume.userResumeId,
      userId: newResume.userId,
      title: newResume.title,
      introduction: newResume.introduction,
      status: newResume.status,
      createdAt: newResume.createdAt,
      updatedAt: newResume.updatedAt,
    };
  };

  getResumes = async (userId, role, sort, status) => {
    const filterCondition = {
      ...(role !== 'RECRUITER' ? { userId } : {}),
      ...(status ? { status } : {}),
    };

    const resumes = await this.prisma.resume.findMany({
      where: filterCondition,
      orderBy: { createdAt: sort.toLowerCase() },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return resumes.map(resume => ({
      userResumeId: resume.userResumeId,
      name: resume.user.name,
      title: resume.title,
      introduction: resume.introduction,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    }));
  };

  getResumeById = async (userId, role, userResumeId) => {
    let whereCondition;
    if (role === 'RECRUITER') {
      whereCondition = { resumeId: Number(userResumeId) };
    } else {
      whereCondition = { userResumeId: Number(userResumeId), userId };
    }

    const resume = await this.prisma.resume.findFirst({
      where: whereCondition,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!resume) {
      return null;
    }

    return {
      resumeId: resume.resumeId,
      userResumeId: resume.userResumeId,
      name: resume.user.name,
      title: resume.title,
      introduction: resume.introduction,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  };

  updateResume = async (userId, userResumeId, title, introduction) => {
    const resume = await this.prisma.resume.findFirst({
      where: {
        userResumeId: Number(userResumeId),
        userId,
      },
    });

    if (!resume) {
      return null;
    }

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (introduction) dataToUpdate.introduction = introduction;

    const updatedResume = await this.prisma.resume.update({
      where: {
        resumeId: resume.resumeId,
      },
      data: dataToUpdate,
    });

    return {
      userResumeId: updatedResume.userResumeId,
      userId: updatedResume.userId,
      title: updatedResume.title,
      introduction: updatedResume.introduction,
      status: updatedResume.status,
      createdAt: updatedResume.createdAt,
      updatedAt: updatedResume.updatedAt,
    };
  };

  deleteResume = async (resumeId) => {
    await this.prisma.resume.delete({
      where: {
        resumeId: resumeId,
      },
    });
  };

  updateResumeStatus = async (resumeId, userId, status, previousStatus, reason) => {
    const [updatedResume, resumeLog] = await this.prisma.$transaction([
      this.prisma.resume.update({
        where: { resumeId: Number(resumeId) },
        data: { status },
      }),
      this.prisma.resumeLog.create({
        data: {
          resumeId: Number(resumeId),
          recruiterId: userId,
          previousStatus,
          newStatus: status,
          reason,
        },
      }),
    ]);

    return {
      resumeLogId: resumeLog.resumeLogId,
      recruiterId: resumeLog.recruiterId,
      resumeId: resumeLog.resumeId,
      previousStatus: resumeLog.previousStatus,
      newStatus: resumeLog.newStatus,
      reason: resumeLog.reason,
      createdAt: resumeLog.createdAt,
    };
  };

  getResumeLogs = async (resumeId) => {
    const logs = await this.prisma.resumeLog.findMany({
      where: { resumeId: Number(resumeId) },
      orderBy: { createdAt: 'desc' },
      include: {
        recruiter: {
          select: {
            name: true,
          },
        },
      },
    });

    return logs.map(log => ({
      resumeLogId: log.resumeLogId,
      recruiterName: log.recruiter.name,
      resumeId: log.resumeId,
      previousStatus: log.previousStatus,
      newStatus: log.newStatus,
      reason: log.reason,
      createdAt: log.createdAt,
    }));
  };
}
