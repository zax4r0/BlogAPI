import 'reflect-metadata';
import 'dotenv/config';
import '@/index';
import App from '@/app';
import validateEnv from '@/utils/validateEnv';

validateEnv();

const app = new App();

app.listen();
