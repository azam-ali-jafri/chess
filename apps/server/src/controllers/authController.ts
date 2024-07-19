import { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "@prisma/client";
import { COOKIE_MAX_AGE } from "../consts";

dotenv.config();

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = (req: Request, res: Response, next: any) => {
  passport.authenticate("google", { session: false }, (err, user: User) => {
    if (err || !user) {
      return res.redirect("/login");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + COOKIE_MAX_AGE),
    });

    res.redirect(process.env.CLIENT_URL as string);
  })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("jwt");
  res.json({ success: true });
};

export const getProfile = (req: Request, res: Response) => {
  res.json(req.user);
};
