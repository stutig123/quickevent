const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Data path
const dataFile = path.join(__dirname, '../data/events.json');

// Admin password (plain text)
const ADMIN_PASSWORD = 'admin123'; // Plain text password

// Helper: Read events
const readEvents = () => {
    if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]');
    return JSON.parse(fs.readFileSync(dataFile));
};

// Helper: Save events
const saveEvents = (events) => {
    fs.writeFileSync(dataFile, JSON.stringify(events, null, 2));
};

// GET: Approved events
app.get('/api/events', (req, res) => {
    const events = readEvents();
    res.json(events.filter(event => event.approved));
});

// POST: Submit new event
app.post('/api/events', (req, res) => {
    const { title, description, date, organizer } = req.body;
    if (!title || !description || !date || !organizer) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const events = readEvents();
    const newEvent = {
        id: Date.now(),
        title,
        description,
        date,
        organizer,
        approved: false,  // Changed to false
        attendees: []
    };
    events.push(newEvent);
    saveEvents(events);
    res.status(201).json({ message: 'Event submitted for approval.' });
});

// PUT: Approve or reject an event
app.put('/api/events/:id/approve', (req, res) => {
    const { approved } = req.body;
    const events = readEvents();
    const event = events.find(e => e.id == req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    event.approved = approved;
    saveEvents(events);
    res.json({ message: `Event ${approved ? 'approved' : 'rejected'}.` });
});

// POST: Join an event
app.post('/api/events/:id/join', (req, res) => {
    const { name } = req.body;
    const events = readEvents();
    const event = events.find(e => e.id == req.params.id && e.approved);
    if (!event) return res.status(404).json({ message: 'Event not found or not approved.' });

    if (!event.attendees.includes(name)) {
        event.attendees.push(name);
        saveEvents(events);
        return res.json({ message: 'Joined successfully.' });
    } else {
        return res.status(409).json({ message: 'Already joined.' });
    }
});

// Get ALL events (admin only)
app.get('/api/all-events', (req, res) => {
    const events = readEvents();
    res.json(events);
});

// POST: Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    // Directly compare the password with the plain text "admin123"
    if (password === ADMIN_PASSWORD) {
        return res.status(200).json({ message: 'Login successful' });
    } else {
        return res.status(401).json({ message: 'Invalid password' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
