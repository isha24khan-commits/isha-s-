// load variable from .env file into process.env
require('dotenv').config();
// import express framework to create server and handle routes 
const express = require('express');
// import cors to allow cross-origin requests from frontend 
const cors = require('cors');
// import db connection pool to interact with MySQL database
const db = require('./db');
// create an instance of express application 
const app = express();

app.use(cors());
app.use(express.json());

// Routes for different API endpoints 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/themes', require('./routes/themes'));
app.use('/api/venues', require('./routes/venues')); 
app.use('/api/services', require('./routes/services'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/checkout', require('./routes/checkout'));

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.json({ message: 'iCore Celebrations API is running' });
});

// --- POST ROUTES (ADD NEW ITEMS) ---

// 1. Add a New Theme
app.post('/api/themes', async (req, res) => {
    const { name, description, image_url } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO THEMES (name, description, image_url) VALUES (?, ?, ?)',
            [name, description, image_url]
        );
        res.status(201).json({ message: 'Theme added!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add a New Venue
app.post('/api/venues', async (req, res) => {
    const { name, location, price_per_day, capacity, IMAGE_URL, vendor_link } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO VENUES (name, location, price_per_day, capacity, IMAGE_URL, vendor_link) VALUES (?, ?, ?, ?, ?, ?)',
            [name, location, price_per_day, capacity, IMAGE_URL, vendor_link]
        );
        res.status(201).json({ message: 'Venue added!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Add a New Service (UPDATED with image_url)
app.post('/api/services', async (req, res) => {
    const { name, category, estimated_price, vendor_link, image_url } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO SERVICES (name, category, estimated_price, vendor_link, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, category, estimated_price, vendor_link, image_url]
        );
        res.status(201).json({ message: 'Service added!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Add a New Package (UPDATED with image_url)
app.post('/api/packages', async (req, res) => {
    const { theme_id, name, price, description, image_url } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO PACKAGES (theme_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
            [theme_id, name, price, description, image_url]
        );
        res.status(201).json({ message: 'Package added!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PUT ROUTES (EDIT EXISTING ITEMS) ---

// 1. Update a Theme
app.put('/api/admin/themes/:id', async (req, res) => {
    const { name, description, image_url } = req.body;
    try {
        await db.execute(
            'UPDATE THEMES SET name = ?, description = ?, image_url = ? WHERE theme_id = ?',
            [name, description, image_url, req.params.id]
        );
        res.json({ message: 'Theme updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Update a Venue
app.put('/api/admin/venues/:id', async (req, res) => {
    const { name, location, price_per_day, capacity, IMAGE_URL, vendor_link } = req.body;
    try {
        await db.execute(
            'UPDATE VENUES SET name = ?, location = ?, price_per_day = ?, capacity = ?, IMAGE_URL = ?, vendor_link = ? WHERE venue_id = ?',
            [name, location, price_per_day, capacity, IMAGE_URL, vendor_link, req.params.id]
        );
        res.json({ message: 'Venue updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Update a Service (UPDATED with image_url)
app.put('/api/admin/services/:id', async (req, res) => {
    const { name, category, estimated_price, vendor_link, image_url } = req.body;
    try {
        await db.execute(
            'UPDATE SERVICES SET name = ?, category = ?, estimated_price = ?, vendor_link = ?, image_url = ? WHERE service_id = ?',
            [name, category, estimated_price, vendor_link, image_url, req.params.id]
        );
        res.json({ message: 'Service updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update a Package (UPDATED with image_url)
app.put('/api/admin/packages/:id', async (req, res) => {
    const { theme_id, name, price, description, image_url } = req.body;
    try {
        await db.execute(
            'UPDATE PACKAGES SET theme_id = ?, name = ?, price = ?, description = ?, image_url = ? WHERE package_id = ?',
            [theme_id, name, price, description, image_url, req.params.id]
        );
        res.json({ message: 'Package updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// use port from .env file or default to 3001 if not set
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Test database connection when server starts 
  db.query('SELECT 1')
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection failed:', err.message));
});