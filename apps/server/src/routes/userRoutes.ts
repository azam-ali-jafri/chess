import { Router } from "express";
import { db } from "../db";
import { authenticateJwt } from "../middlewares/authMiddleware";
import { asyncHandler } from "../libs/utilities";

const router = Router();

router.get(
  "/my/info",
  authenticateJwt,
  asyncHandler(async (req, res) => {
    const user_id = req.user as string;

    const user = await db.user.findUnique({ where: { id: user_id } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  })
);

router.get(
  "/user/info/:userId",
  authenticateJwt,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  })
);

export default router;
