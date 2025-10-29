import express from 'express';

export const notFound = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};