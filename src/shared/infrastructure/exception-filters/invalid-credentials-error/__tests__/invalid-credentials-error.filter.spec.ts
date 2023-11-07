import { Controller, Get, INestApplication } from '@nestjs/common';
import { InvalidCredentialsErrorFilter } from '../invalid-credentials-error.filter';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credential-error';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new InvalidCredentialsError('Invalid credentials');
  }
}

describe('InvalidCredentialsErrorFilter', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new InvalidCredentialsErrorFilter());
    app.init();
  });

  afterAll(async () => {
    await module.close();
  });
  it('should be defined', () => {
    expect(new InvalidCredentialsErrorFilter()).toBeDefined();
  });

  it('should catch a InvalidCredentialsError', async () => {
    const res = await request(app.getHttpServer())
      .get('/stub')
      .expect(400)
      .expect({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid credentials',
      });
  });
});
