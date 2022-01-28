import 'reflect-metadata';
import '@/index';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from 'config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';

import { logger, responseLogger, errorLogger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';
import { schema } from './schema';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core/dist/plugin/landingPage/graphqlPlayground';
import prisma from './utils/prisma';
import { sendrefreshToken } from './utils/token';
import { ApolloServerPluginLandingPageProductionDefault, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';
    this.initializeMiddlewares();
    this.initApolloServer();
    this.initializeErrorHandling();
  }

  public async listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`🎮 http://localhost:${this.port}/graphql`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private async initApolloServer() {
    // const prisma = new PrismaClient();
    const apolloServer = new ApolloServer({
      schema: schema,
      plugins: [
        // ApolloServerPluginLandingPageGraphQLPlayground({
        //   // options
        // }),
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ],
      context: async ({ req, res }) => {
        try {
          // const user = await authMiddleware(req);
          return { req, res, prisma };
        } catch (error) {
          throw new Error(error);
        }
      },
      formatResponse: (response, request) => {
        responseLogger(request);

        return response;
      },
      formatError: error => {
        errorLogger(error);

        return error;
      },
    });

    this.app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200));

    this.app.get('/refresh-token', async function (req: Request, res: Response) {
      const refresh_token = req.cookies.refresh_token;
      try {
        const { acessToken, refreshToken } = await sendrefreshToken(refresh_token);
        res.cookie('refresh_token', refreshToken, { maxAge: 60 * 60 * 1000, httpOnly: true, secure: false });
        res.send({ accessToken: acessToken, refresh_token: refreshToken });
      } catch (error) {
        logger.error(error);
      }
    });



    await apolloServer.start();
    apolloServer.applyMiddleware({ app: this.app, cors: false, path: '/graphql' });
  }

  private initializeErrorHandling() {
    // this.app.use(errorMiddleware);
  }
}

export default App;
