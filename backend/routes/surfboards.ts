import express, { Request, Response, Router } from 'express';
import pool from '../db';
import { authenticateToken } from "../middleware/authMiddleware";


const router = Router();

interface SurfboardParams {
    id: string;
}

interface SurfboardBody {
    owner_id: number;
    title: string;
    description?: string;
    condition: string;
    sale_price?: number;
    price_per_day?: number;
    is_stored?: boolean;
    storage_partner_id?: number | null;
}

// Create a Surfboard
router.post("/", authenticateToken, async (req: Request, res: Response) => {
    const { title, condition } = req.body;
    const userId = (req as any).user.id;

    try {
        const result = await pool.query(
            `INSERT INTO surfboards (owner_id, title, condition) VALUES ($1, $2, $3) RETURNING *`,
            [userId, title, condition]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating surfboard:", err);
        res.status(500).json({ error: "Failed to create surfboard" });
    }
});

// Get All Surfboards
router.get("/", authenticateToken, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM surfboards");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching surfboards:", err);
        res.status(500).json({ error: "Failed to fetch surfboards" });
    }
});

// Update a Surfboard
router.put("/:id", authenticateToken, async (req: Request<{ id: string }, {}, Partial<SurfboardBody>>, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id; // Extract logged-in user's ID
    const { title, condition } = req.body;

    try {
        // Ensure the surfboard belongs to the logged-in user
        const surfboard = await pool.query("SELECT * FROM surfboards WHERE id = $1 AND owner_id = $2", [id, userId]);
        if (surfboard.rowCount === 0) {
            return res.status(403).json({ error: "You can only edit your own surfboards." });
        }

        // Update surfboard
        const result = await pool.query(
            "UPDATE surfboards SET title = $1, condition = $2 WHERE id = $3 RETURNING *",
            [title, condition, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating surfboard:", err);
        res.status(500).json({ error: "Failed to update surfboard" });
    }
});

// Delete a Surfboard
router.delete("/:id", authenticateToken, async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id; // Extract logged-in user's ID

    try {
        // Ensure the surfboard belongs to the logged-in user
        const surfboard = await pool.query("SELECT * FROM surfboards WHERE id = $1 AND owner_id = $2", [id, userId]);
        if (surfboard.rowCount === 0) {
            return res.status(403).json({ error: "You can only delete your own surfboards." });
        }

        await pool.query("DELETE FROM surfboards WHERE id = $1", [id]);
        res.json({ message: "Surfboard deleted successfully." });
    } catch (err) {
        console.error("Error deleting surfboard:", err);
        res.status(500).json({ error: "Failed to delete surfboard" });
    }
});

export default router;
