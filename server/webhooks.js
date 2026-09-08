function fireWebhook(event, activity) {
  const url = (process.env.ZAPIER_WEBHOOK_URL || '').trim();
  if (!url) {
    console.log('[webhook] ZAPIER_WEBHOOK_URL not set, skipping');
    return;
  }

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

  console.log('[webhook] Firing:', event, payload.title);
  console.log('[webhook] URL starts with:', url.substring(0, 40) + '...');

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(r => console.log('[webhook] Response:', r.status, r.statusText))
    .catch(err => console.error('[webhook] Error:', err.message, err.cause || ''));
}

module.exports = { fireWebhook };
