const ZAPIER_URL = process.env.ZAPIER_WEBHOOK_URL;

function fireWebhook(event, activity) {
  if (!ZAPIER_URL) return;

  const payload = {
    event,
    id: activity.id,
    type: activity.type,
    title: activity.title,
    date: activity.date,
    time: activity.time || '',
    notes: activity.notes || '',
    agent: activity.agent || '',
    leadId: activity.leadId || null,
    createdAt: activity.createdAt,
  };

  fetch(ZAPIER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

module.exports = { fireWebhook };
