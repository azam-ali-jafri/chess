import { Router } from "express";
import { db } from "../db";
import { authenticateJwt } from "../middlewares/authMiddleware";

const router = Router();

router.get("/my/info", authenticateJwt, async (req, res) => {
  const user_id = req.user;

  const user = await db.user.findUnique({ where: { id: user_id as string } });

  if (!user) return res.json({ message: "user not found" }).status(404);

  return res.json({ user });
});

router.get("/user/info/:userId", authenticateJwt, async (req, res) => {
  const { userId } = req.params;

  const user = db.user.findUnique({ where: { id: userId } });

  if (!user) return res.json({ message: "user not found" }).status(404);

  return res.json({ user });
});

export default router;
