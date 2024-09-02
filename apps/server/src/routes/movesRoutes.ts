import { Router } from "express";
import { authenticateJwt } from "../middlewares/authMiddleware";
import { asyncHandler } from "../libs/utilities";
import { db } from "../db";

const router = Router();

router.get(
  "/get/game/moves/:gameId",
  authenticateJwt,
  asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    try {
      let moves = await db.move.findMany({ where: { gameId } });

      moves = moves.sort((a, b) => a.moveNumber - b.moveNumber);
      res.json({ moves });
    } catch (error) {
      throw new Error("Internal server error");
    }
  })
);

export default router;
