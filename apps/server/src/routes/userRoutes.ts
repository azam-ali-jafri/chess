import { Router } from "express";
import { db } from "../db";
import { authenticateJwt } from "../middlewares/authMiddleware";

const router = Router();

router.get("/user/info", authenticateJwt, async (req, res) => {
  const user_id = req.user;

  const user = await db.user.findUnique({ where: { id: user_id as string } });

  if (!user) return res.json({ message: "user not found" }).status(404);

  return res.json({ user });
});

export default router;
