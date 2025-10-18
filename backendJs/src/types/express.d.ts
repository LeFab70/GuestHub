import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      nom?: string;
      prenom?: string;
    };
  }
}
