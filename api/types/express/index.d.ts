import { Router } from 'express';

declare module 'express-serve-static-core' {
  interface Router {
    branding: any;
    events: any;
    sermons: any;
    prayer: any;
    donations: any;
  }
}

export {};
