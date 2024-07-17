import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import dotenv from "dotenv";
import { db } from "../db";
import { User } from "@prisma/client";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await db.user.findFirst({ where: { googleId: profile?.id } });
      if (!user) {
        user = await db.user.create({
          data: {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails![0].value,
          },
        });
      }
      return done(null, user);
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (jwtPayload, done) => {
      try {
        const user = await db.user.findFirst({ where: { id: jwtPayload.id } });
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.user.findUnique({ where: { id: id as string } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
