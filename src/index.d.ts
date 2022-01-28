import {Request } from 'express';

declare module 'Request' {
  export interface AUser {
    user: { [key: string]: any };
    userId: any;
    views: any;
  }
}
