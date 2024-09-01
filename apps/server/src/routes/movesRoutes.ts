import { Router } from "express";
import { authenticateJwt } from "../middlewares/authMiddleware";
import { db } from "../db";

const router = Router();

router.get("/get/game/moves/:gameId", authenticateJwt, async (req, res) => {
  try {
    const { gameId } = req.params;

    let moves = await db.move.findMany({ where: { gameId } });

    moves = moves.sort((a, b) => a.moveNumber - b.moveNumber);
    return res.json({ moves });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
