import { ClassSessionRepository } from "../../domain/repositories/class-session.repository";

export class GetUserClassSessionsUseCase {
  constructor(private readonly sessionRepo: ClassSessionRepository) {}

  async execute(userId: string) {
    const sessions = await this.sessionRepo.findByUser(userId);

    return sessions.map((session) => {
      const lastMsg = session.messages.length
        ? session.messages[session.messages.length - 1].content
        : null;

      return {
        sessionId: session.id,
        title: session.title,
        lastMessage: lastMsg,
        updatedAt: session.updatedAt,
      };
    });
  }
}
