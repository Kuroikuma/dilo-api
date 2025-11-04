import { ClassSessionRepository } from "../../domain/repositories/class-session.repository";

export class GetClassSessionByIdUseCase {
  constructor(private readonly sessionRepo: ClassSessionRepository) {}

  async execute(userId: string, sessionId: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new Error('Sesión no encontrada');

    if (session.userId !== userId) {
      throw new Error('No tienes acceso a esta sesión');
    }

    return {
      sessionId: session.id,
      title: session.title,
      messages: session.messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      ),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
