const TYPE_LABELS = {
  appointment: '📅 Appointment',
  reminder: '🔔 Reminder',
  task: '✅ Task',
};

const TZ_OFFSET = (process.env.TIMEZONE_OFFSET || '+08:00').trim();

function formatDateTime(date, time) {
  if (!date) return '';
  const parts = date.split('-');
  const y = parts[0];
  const m = parts[1].padStart(2, '0');
  const d = parts[2].padStart(2, '0');
  if (!time) return `${y}-${m}-${d}`;
  const h = time.split(':')[0].padStart(2, '0');
  const min = (time.split(':')[1] || '00').padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}:00${TZ_OFFSET}`;
}

function addOneHour(date, time) {
  if (!time) return formatDateTime(date, time);
  const parts = date.split('-');
  let h = parseInt(time.split(':')[0]) + 1;
  const min = time.split(':')[1] || '00';
  if (h >= 24) h = 23;
  return formatDateTime(date, h + ':' + min);
}

function fireWebhook(event, activity) {
  const url = (process.env.ZAPIER_WEBHOOK_URL || '').trim();
  if (!url) {
    console.log('[webhook] ZAPIER_WEBHOOK_URL not set, skipping');
    return;
  }

  const typeLabel = TYPE_LABELS[activity.type] || activity.type;
  const calendarTitle = `${typeLabel}: ${activity.title}`;
  const startDateTime = formatDateTime(activity.date, activity.time);
  const endDateTime = activity.time
    ? addOneHour(activity.date, activity.time)
    : formatDateTime(activity.date, activity.time);

  const payload = {
    event,
    id: activity.id,
    type: activity.type,
    title: activity.title,
    calendar_title: calendarTitle,
    date: activity.date,
    time: activity.time || '',
    start_datetime: startDateTime,
    end_datetime: endDateTime,
    all_day: !activity.time,
    notes: activity.notes || '',
    agent: activity.agent || '',
    leadId: activity.leadId || null,
    createdAt: activity.createdAt,
  };

  console.log('[webhook] Firing:', event, calendarTitle);
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
