import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET!,
    async (err: any, decoded: any | undefined) => {
      if (err) {
        return res.status(401).send("Unauthorized");
      }

      req.user = decoded.id;
      next();
    }
  );
};

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
};
