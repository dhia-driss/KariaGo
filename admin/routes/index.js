/*var express = require('express');
var router = express.Router();
const express = require('express');
const router = express.Router();
const Admin = require('../models/admin.js');

// Create Admin
router.post('/', async (req, res) => {
  try {
    const newauth = new auth(req.body);
    await newauth.save();
    res.status(201).json(newauth);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all Admins
router.get('/', async (req, res) => {
  const auths = await auth.find();
  res.json(auths);
});

// Read single Admin
router.get('/:id', async (req, res) => {
  const auth = await auth.findById(req.params.id);
  res.json(auth);
});

// Update Admin
router.put('/:id', async (req, res) => {
  const updatedauth = await auth.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedauth);
});

// Delete Admin
router.delete('/:id', async (req, res) => {
  await auth.findByIdAndDelete(req.params.id);
  res.json({ message: 'auth deleted' });
});

module.exports = router;



module.exports = router;*/
