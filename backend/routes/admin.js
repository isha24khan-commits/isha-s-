const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// --- GET ORDERS ---
router.get('/orders', auth, adminOnly, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.*, u.name AS customer_name, u.email,
        o.submitted_at AS order_date, 
        o.order_status AS status,
        p.event_date, p.guest_count, 
        p.total_estimate AS total_price,
        t.name AS theme_name, v.name AS venue_name
      FROM ORDERS o
      JOIN USERS u ON o.user_id = u.user_id
      JOIN PLANS p ON o.plan_id = p.plan_id
      LEFT JOIN THEMES t ON p.theme_id = t.theme_id
      LEFT JOIN VENUES v ON p.venue_id = v.venue_id
      ORDER BY o.submitted_at DESC
    `);
    res.json(orders);
  } catch (err) {
    console.error('Admin get orders error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- GET PACKAGES ---
// Added ORDER BY ASC to ensure new packages appear at the end
router.get('/packages', auth, adminOnly, async (req, res) => {
  try {
    const [packages] = await db.query('SELECT * FROM PACKAGES ORDER BY package_id ASC');
    res.json(packages);
  } catch (err) {
    console.error('Admin get packages error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- ORDER APPROVAL/REJECTION ---
router.post('/orders/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const [order] = await db.query('SELECT * FROM ORDERS WHERE order_id = ?', [req.params.id]);
    if (order.length === 0) return res.status(404).json({ error: 'Order not found' });
    await db.query('UPDATE ORDERS SET order_status = "confirmed", payment_status = "paid" WHERE order_id = ?', [req.params.id]);
    await db.query('INSERT INTO ORDER_APPROVALS (order_id, decision) VALUES (?, "approved")', [req.params.id]);
    res.json({ message: 'Order approved successfully' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/orders/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const [order] = await db.query('SELECT * FROM ORDERS WHERE order_id = ?', [req.params.id]);
    if (order.length === 0) return res.status(404).json({ error: 'Order not found' });
    await db.query('UPDATE ORDERS SET order_status = "cancelled", payment_status = "refunded" WHERE order_id = ?', [req.params.id]);
    await db.query('INSERT INTO ORDER_APPROVALS (order_id, decision) VALUES (?, "rejected")', [req.params.id]);
    res.json({ message: 'Order rejected successfully' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// --- ADD (POST) ROUTES ---

router.post('/venues', auth, adminOnly, async (req, res) => {
  const { name, image_url, location, capacity, price_per_day, vendor_link } = req.body;
  try {
    await db.query(
      'INSERT INTO VENUES (name, image_url, location, capacity, price_per_day, vendor_link) VALUES (?, ?, ?, ?, ?, ?)',
      [name || null, image_url || null, location || null, capacity || null, price_per_day || null, vendor_link || null]
    );
    res.status(201).json({ message: 'Venue added successfully' });
  } catch (err) { 
    console.error("Venue POST Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

router.post('/services', auth, adminOnly, async (req, res) => {
  const { name, image_url, category, estimated_price, vendor_link } = req.body;
  try {
    await db.query(
      'INSERT INTO SERVICES (name, image_url, category, estimated_price, vendor_link) VALUES (?, ?, ?, ?, ?)',
      [name || null, image_url || null, category || null, estimated_price || null, vendor_link || null]
    );
    res.status(201).json({ message: 'Service added successfully' });
  } catch (err) { 
    console.error("Service POST Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

router.post('/themes', auth, adminOnly, async (req, res) => {
  const { name, description, image_url } = req.body;
  try {
    await db.query(
      'INSERT INTO THEMES (name, description, image_url) VALUES (?, ?, ?)',
      [name || null, description || null, image_url || null]
    );
    res.status(201).json({ message: 'Theme added successfully' });
  } catch (err) { 
    console.error("Theme POST Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

router.post('/packages', auth, adminOnly, async (req, res) => {
  const { name, description, image_url, price, theme_id } = req.body;
  try {
    await db.query(
      'INSERT INTO PACKAGES (name, description, image_url, price, theme_id) VALUES (?, ?, ?, ?, ?)',
      [name || null, description || null, image_url || null, price || null, theme_id || null]
    );
    res.status(201).json({ message: 'Package added successfully' });
  } catch (err) { 
    console.error("Package POST Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

// --- UPDATE (PUT) ROUTES ---

router.put('/venues/:id', auth, adminOnly, async (req, res) => {
  const { name, image_url, location, capacity, price_per_day, vendor_link } = req.body;
  try {
    await db.query(
      'UPDATE VENUES SET name = ?, image_url = ?, location = ?, capacity = ?, price_per_day = ?, vendor_link = ? WHERE venue_id = ?',
      [name || null, image_url || null, location || null, capacity || null, price_per_day || null, vendor_link || null, req.params.id]
    );
    res.json({ message: 'Venue updated successfully' });
  } catch (err) { 
    console.error("Venue UPDATE Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

router.put('/services/:id', auth, adminOnly, async (req, res) => {
  const { name, image_url, category, estimated_price, vendor_link } = req.body;
  try {
    await db.query(
      'UPDATE SERVICES SET name = ?, image_url = ?, category = ?, estimated_price = ?, vendor_link = ? WHERE service_id = ?',
      [name || null, image_url || null, category || null, estimated_price || null, vendor_link || null, req.params.id]
    );
    res.json({ message: 'Service updated successfully' });
  } catch (err) { 
    console.error("Service UPDATE Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

router.put('/themes/:id', auth, adminOnly, async (req, res) => {
  const { name, description, image_url } = req.body;
  try {
    await db.query(
      'UPDATE THEMES SET name = ?, description = ?, image_url = ? WHERE theme_id = ?', 
      [name || null, description || null, image_url || null, req.params.id]
    );
    res.json({ message: 'Theme updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/packages/:id', auth, adminOnly, async (req, res) => {
  const { name, description, image_url, price, theme_id } = req.body;
  try {
    await db.query(
      'UPDATE PACKAGES SET name = ?, description = ?, image_url = ?, price = ?, theme_id = ? WHERE package_id = ?', 
      [name || null, description || null, image_url || null, price || null, theme_id || null, req.params.id]
    );
    res.json({ message: 'Package updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- DELETE ROUTES ---

router.delete('/themes/:id', auth, adminOnly, async (req, res) => {
  await db.query('DELETE FROM THEMES WHERE theme_id = ?', [req.params.id]);
  res.json({ message: 'Theme deleted successfully' });
});

router.delete('/venues/:id', auth, adminOnly, async (req, res) => {
  await db.query('DELETE FROM VENUES WHERE venue_id = ?', [req.params.id]);
  res.json({ message: 'Venue deleted successfully' });
});

router.delete('/services/:id', auth, adminOnly, async (req, res) => {
  await db.query('DELETE FROM SERVICES WHERE service_id = ?', [req.params.id]);
  res.json({ message: 'Service deleted successfully' });
});

router.delete('/packages/:id', auth, adminOnly, async (req, res) => {
  await db.query('DELETE FROM PACKAGES WHERE package_id = ?', [req.params.id]);
  res.json({ message: 'Package deleted successfully' });
});

module.exports = router;