import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        httpsOptions:
            process.env.SSL === 'true'
                ? {
                      key: readFileSync(resolve(__dirname, '..', process.env.SSL_KEY!)),
                      cert: readFileSync(resolve(__dirname, '..', process.env.SSL_CERT!)),
                  }
                : undefined,
    });
    app.enableCors();
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
