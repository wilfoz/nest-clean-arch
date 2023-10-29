import { SignInUseCase } from '@/users/application/usecases/signin.usecase';

export class SignInDto implements SignInUseCase.Input {
  email: string;
  password: string;
}
