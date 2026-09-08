const express = require('express');
const prisma = require('../db');
const { fireWebhook } = require('../webhooks');
const router = express.Router();

router.get('/', async (req, res) => {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(activities);
});

router.get('/lead/:leadId', async (req, res) => {
  const activities = await prisma.activity.findMany({
    where: { leadId: parseInt(req.params.leadId) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(activities);
});

router.post('/', async (req, res) => {
  const activity = await prisma.activity.create({ data: req.body });
  fireWebhook('activity.created', activity);
  res.status(201).json(activity);
});

router.put('/:id', async (req, res) => {
  const activity = await prisma.activity.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  fireWebhook('activity.updated', activity);
  res.json(activity);
});

router.delete('/:id', async (req, res) => {
  const activity = await prisma.activity.delete({ where: { id: parseInt(req.params.id) } });
  fireWebhook('activity.deleted', activity);
  res.json({ ok: true });
});

module.exports = router;
