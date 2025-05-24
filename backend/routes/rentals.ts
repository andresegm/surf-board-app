import express, { Request, Response, Router } from 'express';
import pool from '../db';
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

interface RentalParams {
    id: string;
}

// Get all rentals for the logged-in user (either as renter or owner)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { status, role } = req.query;

    try {
        let query = `
            SELECT 
                r.*,
                s.title as surfboard_title,
                s.image_url as surfboard_image,
                u_owner.email as owner_email,
                u_renter.email as renter_email
            FROM rentals r
            JOIN surfboards s ON r.surfboard_id = s.id
            JOIN users u_owner ON r.owner_id = u_owner.id
            JOIN users u_renter ON r.renter_id = u_renter.id
            WHERE 
        `;

        const queryParams: any[] = [];

        if (role === 'owner') {
            query += 'r.owner_id = $1';
            queryParams.push(userId);
        } else if (role === 'renter') {
            query += 'r.renter_id = $1';
            queryParams.push(userId);
        } else {
            query += '(r.owner_id = $1 OR r.renter_id = $1)';
            queryParams.push(userId);
        }

        if (status) {
            query += ' AND r.status = $' + (queryParams.length + 1);
            queryParams.push(status);
        }

        query += ' ORDER BY r.created_at DESC';

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching rentals:", err);
        res.status(500).json({ error: "Failed to fetch rentals" });
    }
});

// Get rental details by ID
router.get("/:id", authenticateToken, async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    try {
        const result = await pool.query(`
            SELECT 
                r.*,
                s.title as surfboard_title,
                s.image_url as surfboard_image,
                s.condition as surfboard_condition,
                s.dimensions as surfboard_dimensions,
                u_owner.email as owner_email,
                u_renter.email as renter_email,
                p.name as storage_partner_name,
                p.location as storage_partner_location
            FROM rentals r
            JOIN surfboards s ON r.surfboard_id = s.id
            JOIN users u_owner ON r.owner_id = u_owner.id
            JOIN users u_renter ON r.renter_id = u_renter.id
            LEFT JOIN storage_partners p ON s.storage_partner_id = p.id
            WHERE r.id = $1 AND (r.owner_id = $2 OR r.renter_id = $2)
        `, [id, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Rental not found or you don't have permission to view it" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching rental details:", err);
        res.status(500).json({ error: "Failed to fetch rental details" });
    }
});

// Create a new rental
router.post("/", authenticateToken, async (req: Request, res: Response) => {
    const { surfboard_id, start_date, end_date } = req.body;
    const renter_id = (req as any).user.id;

    try {
        // Check if the surfboard exists and is available for rent
        const surfboardResult = await pool.query(`
            SELECT * FROM surfboards WHERE id = $1 AND for_rent = true
        `, [surfboard_id]);

        if (surfboardResult.rowCount === 0) {
            return res.status(404).json({ error: "Surfboard not found or not available for rent" });
        }

        const surfboard = surfboardResult.rows[0];

        // Can't rent your own surfboard
        if (surfboard.owner_id === renter_id) {
            return res.status(400).json({ error: "You cannot rent your own surfboard" });
        }

        // Check if the surfboard is already rented for the requested dates
        const overlapResult = await pool.query(`
            SELECT * FROM rentals 
            WHERE surfboard_id = $1 
            AND status IN ('pending', 'approved', 'active')
            AND (
                (start_date <= $2 AND end_date >= $2) OR
                (start_date <= $3 AND end_date >= $3) OR
                (start_date >= $2 AND end_date <= $3)
            )
        `, [surfboard_id, start_date, end_date]);

        if (overlapResult.rowCount && overlapResult.rowCount > 0) {
            return res.status(400).json({ error: "Surfboard is already booked for these dates" });
        }

        // Calculate total rental cost
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);
        const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
        const total_amount = days * (surfboard.price_per_day || 0);

        // Create the rental record
        const result = await pool.query(`
            INSERT INTO rentals (
                surfboard_id,
                renter_id,
                owner_id,
                start_date,
                end_date,
                total_amount,
                status,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING *
        `, [
            surfboard_id,
            renter_id,
            surfboard.owner_id,
            start_date,
            end_date,
            total_amount,
            'pending'
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating rental:", err);
        res.status(500).json({ error: "Failed to create rental" });
    }
});

// Update rental status (approve, reject, cancel, complete)
router.put("/:id/status", authenticateToken, async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    // Validate status
    const validStatuses = ['approved', 'rejected', 'cancelled', 'completed', 'active'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be one of: " + validStatuses.join(', ') });
    }

    try {
        // Get the rental with surfboard info
        const rentalResult = await pool.query(`
            SELECT r.*, s.owner_id, s.price_per_day
            FROM rentals r
            JOIN surfboards s ON r.surfboard_id = s.id
            WHERE r.id = $1
        `, [id]);

        if (rentalResult.rowCount === 0) {
            return res.status(404).json({ error: "Rental not found" });
        }

        const rental = rentalResult.rows[0];

        // Check permissions based on the requested status change
        if (status === 'approved' || status === 'rejected') {
            // Only the owner can approve/reject
            if (rental.owner_id !== userId) {
                return res.status(403).json({ error: "Only the surfboard owner can approve or reject rental requests" });
            }

            // Can only approve/reject pending rentals
            if (rental.status !== 'pending') {
                return res.status(400).json({ error: "Can only approve or reject pending rental requests" });
            }
        } else if (status === 'cancelled') {
            // Either party can cancel before it's active
            if (rental.owner_id !== userId && rental.renter_id !== userId) {
                return res.status(403).json({ error: "Only the surfboard owner or renter can cancel a rental" });
            }

            // Can only cancel pending or approved rentals
            if (rental.status !== 'pending' && rental.status !== 'approved') {
                return res.status(400).json({ error: "Can only cancel pending or approved rentals" });
            }
        } else if (status === 'completed') {
            // Only the owner can mark as completed
            if (rental.owner_id !== userId) {
                return res.status(403).json({ error: "Only the surfboard owner can mark a rental as completed" });
            }

            // Can only complete active rentals
            if (rental.status !== 'active') {
                return res.status(400).json({ error: "Can only complete active rentals" });
            }
        } else if (status === 'active') {
            // Only the owner can mark as active (when the renter picks up)
            if (rental.owner_id !== userId) {
                return res.status(403).json({ error: "Only the surfboard owner can mark a rental as active" });
            }

            // Can only activate approved rentals
            if (rental.status !== 'approved') {
                return res.status(400).json({ error: "Can only activate approved rentals" });
            }
        }

        // Update the rental status
        await pool.query(
            "UPDATE rentals SET status = $1, updated_at = NOW() WHERE id = $2",
            [status, id]
        );

        // If approved, create a pending transaction record
        if (status === 'approved') {
            // For approved rentals, we'll create a transaction that will be processed when the rental is marked active
            await pool.query(`
                INSERT INTO transactions (
                    rental_id,
                    amount,
                    status,
                    transaction_type,
                    created_at
                ) VALUES ($1, $2, $3, $4, NOW())
            `, [
                id,
                rental.total_amount,
                'pending',
                'rental'
            ]);
        }

        res.json({
            message: `Rental status updated to ${status}`,
            rental_id: id
        });
    } catch (err) {
        console.error("Error updating rental status:", err);
        res.status(500).json({ error: "Failed to update rental status" });
    }
});

export default router; 