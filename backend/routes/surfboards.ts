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
    image_url?: string;
    dimensions?: string;
    location?: string;
    for_rent?: boolean;
    for_sale?: boolean;
}

// Create a Surfboard
router.post("/", authenticateToken, async (req: Request, res: Response) => {
    const {
        title,
        description,
        condition,
        sale_price,
        price_per_day,
        image_url,
        dimensions,
        location,
        for_rent,
        for_sale
    } = req.body;
    const userId = (req as any).user.id;

    try {
        const result = await pool.query(
            `INSERT INTO surfboards (
                owner_id, 
                title, 
                description, 
                condition, 
                sale_price, 
                price_per_day,
                image_url,
                dimensions,
                location,
                for_rent,
                for_sale,
                is_stored,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *`,
            [
                userId,
                title,
                description || null,
                condition,
                sale_price || null,
                price_per_day || null,
                image_url || null,
                dimensions || null,
                location || null,
                for_rent || false,
                for_sale || false,
                false // initially not stored
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating surfboard:", err);
        res.status(500).json({ error: "Failed to create surfboard" });
    }
});

// Get All Surfboards
router.get("/", async (req: Request, res: Response) => {
    const { for_rent, for_sale, location } = req.query;

    let query = "SELECT * FROM surfboards WHERE 1=1";
    const params: any[] = [];

    if (for_rent === 'true') {
        query += " AND for_rent = true";
    }

    if (for_sale === 'true') {
        query += " AND for_sale = true";
    }

    if (location) {
        query += " AND location ILIKE $" + (params.length + 1);
        params.push(`%${location}%`);
    }

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching surfboards:", err);
        res.status(500).json({ error: "Failed to fetch surfboards" });
    }
});

// Get User's Own Surfboards
router.get("/my-boards", authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        const result = await pool.query("SELECT * FROM surfboards WHERE owner_id = $1", [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching user's surfboards:", err);
        res.status(500).json({ error: "Failed to fetch your surfboards" });
    }
});

// Get Surfboard by ID
router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT s.*, p.name as storage_partner_name, p.location as storage_location
            FROM surfboards s
            LEFT JOIN storage_partners p ON s.storage_partner_id = p.id
            WHERE s.id = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Surfboard not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching surfboard by ID:", err);
        res.status(500).json({ error: "Failed to fetch surfboard" });
    }
});

// Update a Surfboard
router.put("/:id", authenticateToken, async (req: Request<{ id: string }, {}, Partial<SurfboardBody>>, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const {
        title,
        description,
        condition,
        sale_price,
        price_per_day,
        image_url,
        dimensions,
        location,
        for_rent,
        for_sale
    } = req.body;

    try {
        // Ensure the surfboard belongs to the logged-in user
        const surfboard = await pool.query("SELECT * FROM surfboards WHERE id = $1 AND owner_id = $2", [id, userId]);
        if (surfboard.rowCount === 0) {
            return res.status(403).json({ error: "You can only edit your own surfboards." });
        }

        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(title);
        }

        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }

        if (condition !== undefined) {
            updates.push(`condition = $${paramCount++}`);
            values.push(condition);
        }

        if (sale_price !== undefined) {
            updates.push(`sale_price = $${paramCount++}`);
            values.push(sale_price);
        }

        if (price_per_day !== undefined) {
            updates.push(`price_per_day = $${paramCount++}`);
            values.push(price_per_day);
        }

        if (image_url !== undefined) {
            updates.push(`image_url = $${paramCount++}`);
            values.push(image_url);
        }

        if (dimensions !== undefined) {
            updates.push(`dimensions = $${paramCount++}`);
            values.push(dimensions);
        }

        if (location !== undefined) {
            updates.push(`location = $${paramCount++}`);
            values.push(location);
        }

        if (for_rent !== undefined) {
            updates.push(`for_rent = $${paramCount++}`);
            values.push(for_rent);
        }

        if (for_sale !== undefined) {
            updates.push(`for_sale = $${paramCount++}`);
            values.push(for_sale);
        }

        updates.push(`updated_at = NOW()`);

        // Add surfboard ID to parameters
        values.push(id);

        // Execute update
        const result = await pool.query(
            `UPDATE surfboards SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating surfboard:", err);
        res.status(500).json({ error: "Failed to update surfboard" });
    }
});

// Assign Surfboard to Storage Partner
router.post("/:id/store", authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { storage_partner_id } = req.body;
    const userId = (req as any).user.id;

    try {
        // Verify surfboard ownership
        const surfboard = await pool.query("SELECT * FROM surfboards WHERE id = $1 AND owner_id = $2", [id, userId]);
        if (surfboard.rowCount === 0) {
            return res.status(403).json({ error: "You can only store your own surfboards." });
        }

        // Verify the storage partner exists
        const partner = await pool.query("SELECT * FROM storage_partners WHERE id = $1", [storage_partner_id]);
        if (partner.rowCount === 0) {
            return res.status(404).json({ error: "Storage partner not found." });
        }

        // Update surfboard storage status
        const result = await pool.query(
            `UPDATE surfboards SET 
                is_stored = true, 
                storage_partner_id = $1, 
                storage_start_date = NOW() 
            WHERE id = $2 RETURNING *`,
            [storage_partner_id, id]
        );

        // Create storage agreement record
        await pool.query(
            `INSERT INTO storage_agreements 
                (surfboard_id, partner_id, owner_id, start_date, status)
            VALUES ($1, $2, $3, NOW(), 'active')`,
            [id, storage_partner_id, userId]
        );

        res.json({
            message: "Surfboard has been stored successfully",
            surfboard: result.rows[0]
        });
    } catch (err) {
        console.error("Error storing surfboard:", err);
        res.status(500).json({ error: "Failed to store surfboard" });
    }
});

// Mark Surfboard as Rented
router.post("/:id/rent", authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { start_date, end_date } = req.body;
    const renterId = (req as any).user.id;

    try {
        // Get surfboard details
        const surfboardResult = await pool.query("SELECT * FROM surfboards WHERE id = $1", [id]);

        if (surfboardResult.rowCount === 0) {
            return res.status(404).json({ error: "Surfboard not found" });
        }

        const surfboard = surfboardResult.rows[0];

        if (!surfboard.for_rent) {
            return res.status(400).json({ error: "This surfboard is not available for rent" });
        }

        if (surfboard.owner_id === renterId) {
            return res.status(400).json({ error: "You cannot rent your own surfboard" });
        }

        // Calculate rental amount
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const totalAmount = daysCount * (surfboard.price_per_day || 0);

        // Create rental record
        const result = await pool.query(
            `INSERT INTO rentals 
                (surfboard_id, renter_id, owner_id, start_date, end_date, total_amount, status) 
            VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
            RETURNING *`,
            [id, renterId, surfboard.owner_id, start_date, end_date, totalAmount]
        );

        res.status(201).json({
            message: "Rental request created successfully",
            rental: result.rows[0]
        });
    } catch (err) {
        console.error("Error creating rental:", err);
        res.status(500).json({ error: "Failed to create rental" });
    }
});

// Delete a Surfboard
router.delete("/:id", authenticateToken, async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
        // Ensure the surfboard belongs to the logged-in user
        const surfboard = await pool.query("SELECT * FROM surfboards WHERE id = $1 AND owner_id = $2", [id, userId]);
        if (surfboard.rowCount === 0) {
            return res.status(403).json({ error: "You can only delete your own surfboards." });
        }

        // Check if surfboard has active rentals
        const activeRentals = await pool.query(
            "SELECT * FROM rentals WHERE surfboard_id = $1 AND status IN ('active', 'pending')",
            [id]
        );

        if (activeRentals.rowCount && activeRentals.rowCount > 0) {
            return res.status(400).json({
                error: "Cannot delete surfboard with active or pending rentals"
            });
        }

        await pool.query("DELETE FROM surfboards WHERE id = $1", [id]);
        res.json({ message: "Surfboard deleted successfully." });
    } catch (err) {
        console.error("Error deleting surfboard:", err);
        res.status(500).json({ error: "Failed to delete surfboard" });
    }
});

export default router;
