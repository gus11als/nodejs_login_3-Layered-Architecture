export class ResumeController {
  constructor(resumeService) {
    this.resumeService = resumeService;
  }

  createResume = async (req, res, next) => {
    try {
      const { title, introduction } = req.body;
      const { userId } = req.user;
      const newResume = await this.resumeService.createResume(userId, title, introduction);
      res.status(201).json(newResume);
    } catch (err) {
      next(err);
    }
  };

  getResumes = async (req, res, next) => {
    try {
      const { userId, role } = req.user;
      const { sort, status } = req.query;
      const resumes = await this.resumeService.getResumes(userId, role, sort, status);
      res.status(200).json(resumes);
    } catch (err) {
      next(err);
    }
  };

  getResumeById = async (req, res, next) => {
    try {
      const { userId, role } = req.user;
      const { userResumeId } = req.params;
      const resume = await this.resumeService.getResumeById(userId, role, userResumeId);
      res.status(200).json(resume);
    } catch (err) {
      next(err);
    }
  };

  updateResume = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { userResumeId } = req.params;
      const { title, introduction } = req.body;
      const updatedResume = await this.resumeService.updateResume(userId, userResumeId, title, introduction);
      res.status(200).json(updatedResume);
    } catch (err) {
      next(err);
    }
  };

  deleteResume = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { userResumeId } = req.params;
      await this.resumeService.deleteResume(userId, userResumeId);
      res.status(200).json({ message: '이력서가 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  };

  updateResumeStatus = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { resumeId } = req.params;
      const { status, reason } = req.body;
      const resumeLog = await this.resumeService.updateResumeStatus(userId, resumeId, status, reason);
      res.status(200).json(resumeLog);
    } catch (err) {
      next(err);
    }
  };

  getResumeLogs = async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      const logs = await this.resumeService.getResumeLogs(resumeId);
      res.status(200).json(logs);
    } catch (err) {
      next(err);
    }
  };
}
