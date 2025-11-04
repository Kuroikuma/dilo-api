import { MongoTransactionService } from '../../infrastructure/mongo/mongo-transaction.service';
import { ClientSession } from 'mongoose';

export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const transactionService: MongoTransactionService = this.mongoTransactionService;
      if (!transactionService || typeof transactionService.start !== 'function') {
        throw new Error(
          'El servicio MongoTransactionService debe estar disponible como "this.mongoTransactionService"',
        );
      }

      const session: ClientSession = await transactionService.start();

      try {
        // Inyectamos session como último argumento del método
        const result = await originalMethod.apply(this, [...args, session]);
        await transactionService.commit(session);
        return result;
      } catch (error) {
        await transactionService.rollback(session);
        throw error;
      }
    };

    return descriptor;
  };
}
