import express, { Request, Response, Router } from 'express';
import pool from '../db';
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

interface StoragePartnerBody {
    name: string;
    description?: string;
    location: string;
    address: string;
    contact_email: string;
    contact_phone?: string;
    commission_rate: number;
    max_capacity?: number;
    is_verified?: boolean;
}

// Get all storage partners
router.get("/", async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT id, name, description, location, address, 
                   contact_email, contact_phone, commission_rate, 
                   max_capacity, is_verified, created_at 
            FROM storage_partners
            WHERE is_verified = true
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching storage partners:", err);
        res.status(500).json({ error: "Failed to fetch storage partners" });
    }
});

// Get storage partner by ID
router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT id, name, description, location, address, 
                   contact_email, contact_phone, commission_rate, 
                   max_capacity, is_verified, created_at 
            FROM storage_partners 
            WHERE id = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Storage partner not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching storage partner:", err);
        res.status(500).json({ error: "Failed to fetch storage partner" });
    }
});

// Register as a storage partner (for business users)
router.post("/register", authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const {
        name,
        description,
        location,
        address,
        contact_email,
        contact_phone,
        commission_rate,
        max_capacity
    } = req.body;

    try {
        // First check if the user already has a registered partner
        const existingPartner = await pool.query(
            "SELECT * FROM storage_partners WHERE user_id = $1",
            [userId]
        );

        if (existingPartner.rowCount && existingPartner.rowCount > 0) {
            return res.status(400).json({
                error: "You already have a registered storage partner account"
            });
        }

        // Create new storage partner record
        const result = await pool.query(`
            INSERT INTO storage_partners (
                user_id,
                name, 
                description, 
                location,
                address,
                contact_email,
                contact_phone,
                commission_rate,
                max_capacity,
                is_verified,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *
        `, [
            userId,
            name,
            description || null,
            location,
            address,
            contact_email,
            contact_phone || null,
            commission_rate,
            max_capacity || null,
            false // partners need to be verified by admin
        ]);

        res.status(201).json({
            message: "Storage partner registration submitted for review",
            partner: result.rows[0]
        });
    } catch (err) {
        console.error("Error registering storage partner:", err);
        res.status(500).json({ error: "Failed to register as storage partner" });
    }
});

// Update storage partner profile (for partner users)
router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const {
        name,
        description,
        location,
        address,
        contact_email,
        contact_phone,
        commission_rate,
        max_capacity
    } = req.body;

    try {
        // Check if the partner belongs to the user
        const partner = await pool.query(
            "SELECT * FROM storage_partners WHERE id = $1 AND user_id = $2",
            [id, userId]
        );

        if (!partner.rowCount || partner.rowCount === 0) {
            return res.status(403).json({
                error: "You can only update your own storage partner profile"
            });
        }

        // Build update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }

        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }

        if (location !== undefined) {
            updates.push(`location = $${paramCount++}`);
            values.push(location);
        }

        if (address !== undefined) {
            updates.push(`address = $${paramCount++}`);
            values.push(address);
        }

        if (contact_email !== undefined) {
            updates.push(`contact_email = $${paramCount++}`);
            values.push(contact_email);
        }

        if (contact_phone !== undefined) {
            updates.push(`contact_phone = $${paramCount++}`);
            values.push(contact_phone);
        }

        if (commission_rate !== undefined) {
            updates.push(`commission_rate = $${paramCount++}`);
            values.push(commission_rate);
        }

        if (max_capacity !== undefined) {
            updates.push(`max_capacity = $${paramCount++}`);
            values.push(max_capacity);
        }

        updates.push(`updated_at = NOW()`);

        // Add partner ID to parameters
        values.push(id);

        // Execute update
        const result = await pool.query(
            `UPDATE storage_partners SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating storage partner:", err);
        res.status(500).json({ error: "Failed to update storage partner" });
    }
});

// Get all surfboards currently stored with a partner
router.get("/:id/stored-surfboards", authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
        // Verify this partner belongs to the user
        const partner = await pool.query(
            "SELECT * FROM storage_partners WHERE id = $1 AND user_id = $2",
            [id, userId]
        );

        if (!partner.rowCount || partner.rowCount === 0) {
            return res.status(403).json({
                error: "You can only view surfboards stored with your own partner account"
            });
        }

        // Get all stored surfboards
        const result = await pool.query(`
            SELECT s.*, u.email as owner_email
            FROM surfboards s
            JOIN users u ON s.owner_id = u.id
            WHERE s.storage_partner_id = $1 AND s.is_stored = true
        `, [id]);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching stored surfboards:", err);
        res.status(500).json({ error: "Failed to fetch stored surfboards" });
    }
});

// Accept or reject a storage request
router.put("/storage-requests/:requestId", authenticateToken, async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"
    const userId = (req as any).user.id;

    if (status !== "accepted" && status !== "rejected") {
        return res.status(400).json({ error: "Status must be 'accepted' or 'rejected'" });
    }

    try {
        // Get the storage request with partner info
        const requestResult = await pool.query(`
            SELECT sa.*, sp.user_id as partner_user_id 
            FROM storage_agreements sa
            JOIN storage_partners sp ON sa.partner_id = sp.id
            WHERE sa.id = $1
        `, [requestId]);

        if (!requestResult.rowCount || requestResult.rowCount === 0) {
            return res.status(404).json({ error: "Storage request not found" });
        }

        const request = requestResult.rows[0];

        // Check if this user is the partner associated with this request
        if (request.partner_user_id !== userId) {
            return res.status(403).json({ error: "You can only manage your own storage requests" });
        }

        // Update the storage agreement status
        await pool.query(
            "UPDATE storage_agreements SET status = $1, updated_at = NOW() WHERE id = $2",
            [status, requestId]
        );

        if (status === "accepted") {
            // If accepted, update the surfboard storage status as well
            await pool.query(
                "UPDATE surfboards SET is_stored = true, storage_start_date = NOW() WHERE id = $1",
                [request.surfboard_id]
            );
        } else {
            // If rejected, remove the storage_partner_id
            await pool.query(
                "UPDATE surfboards SET storage_partner_id = NULL WHERE id = $1",
                [request.surfboard_id]
            );
        }

        res.json({
            message: `Storage request ${status}`,
            requestId
        });
    } catch (err) {
        console.error("Error handling storage request:", err);
        res.status(500).json({ error: "Failed to process storage request" });
    }
});

export default router; 