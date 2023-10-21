import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { InMemoryRepository } from '@/shared/domain/repositories/in-memory-repository';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { ConflictError } from '../../../../../shared/domain/errors/conflict-error';
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable-repository';

export class UserInMemoryRepository
  extends InMemorySearchableRepository<UserEntity>
  // eslint-disable-next-line prettier/prettier
  implements UserRepository {
  async findByEmail(email: string): Promise<UserEntity> {
    const entity = this.items.find(item => item.email === email);
    if (!entity) {
      throw new NotFoundError(`Entity not found using email ${email}`);
    }
    return entity;
  }

  async emailExists(email: string): Promise<void> {
    const entity = this.items.find(item => item.email === email);
    if (entity) {
      throw new ConflictError(`Email Address already used - ${email}`);
    }
  }
}
