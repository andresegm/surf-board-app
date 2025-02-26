import express, { Request, Response, Router } from 'express';
import pool from '../db';

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
router.post('/', async (req: Request, res: Response) => {
    const { owner_id, title, description, condition, sale_price, price_per_day, is_stored, storage_partner_id } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO surfboards (owner_id, title, description, condition, sale_price, price_per_day, is_stored, storage_partner_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [owner_id, title, description, condition, sale_price, price_per_day, is_stored, storage_partner_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating surfboard:', err);
        res.status(500).json({ error: 'Failed to create surfboard' });
    }
});

// Get All Surfboards
router.get('/', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM surfboards');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching surfboards:', err);
        res.status(500).json({ error: 'Failed to fetch surfboards' });
    }
});

// Update a Surfboard
router.put('/:id', async (req: Request<{ id: string }, {}, Partial<SurfboardBody>>, res: Response) => {
    const { id } = req.params;
    const { title, description, condition, sale_price, price_per_day, is_stored, storage_partner_id } = req.body;

    try {
        // If storage_partner_id is provided, check if it exists in users table
        if (storage_partner_id) {
            const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [storage_partner_id]);
            if (userCheck.rowCount === 0) {
                return res.status(400).json({ error: 'Invalid storage_partner_id. User does not exist.' });
            }
        }

        const result = await pool.query(
            `UPDATE surfboards 
            SET title = $1, description = $2, condition = $3, sale_price = $4, price_per_day = $5, is_stored = $6, storage_partner_id = $7 
            WHERE id = $8 RETURNING *`,
            [title, description, condition, sale_price, price_per_day, is_stored, storage_partner_id, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'Surfboard not found' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating surfboard:', err);
        res.status(500).json({ error: 'Failed to update surfboard', details: (err as Error).message });
    }
});


// Delete a Surfboard
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`DELETE FROM surfboards WHERE id = $1 RETURNING *`, [id]);

        if (result.rowCount === 0) return res.status(404).json({ error: 'Surfboard not found' });

        res.json({ message: 'Surfboard deleted successfully' });
    } catch (err) {
        console.error('Error deleting surfboard:', err);
        res.status(500).json({ error: 'Failed to delete surfboard' });
    }
});

export default router;
