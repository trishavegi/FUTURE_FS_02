const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory storage (no MongoDB needed for now)
let leads = [];
let nextId = 1;

// API Routes

// Get all leads
app.get('/api/leads', (req, res) => {
  res.json({ success: true, leads });
});

// Add new lead
app.post('/api/leads', (req, res) => {
  const newLead = {
    id: nextId++,
    ...req.body,
    status: 'new',
    createdAt: new Date().toISOString(),
    notes: req.body.notes ? [{ note: req.body.notes, createdAt: new Date().toISOString() }] : []
  };
  leads.unshift(newLead);
  res.json({ success: true, lead: newLead });
});

// Update lead
app.put('/api/leads/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = leads.findIndex(l => l.id === id);
  if (index !== -1) {
    leads[index] = { ...leads[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, lead: leads[index] });
  } else {
    res.status(404).json({ success: false, message: 'Lead not found' });
  }
});

// Delete lead
app.delete('/api/leads/:id', (req, res) => {
  const id = parseInt(req.params.id);
  leads = leads.filter(l => l.id !== id);
  res.json({ success: true });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'dummy-token-123' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ API ready at http://localhost:${PORT}/api/leads`);
});