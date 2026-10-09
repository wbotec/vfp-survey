/*
 * POST /api/submit
 * Hukagua majibu kisha huyapeleka kwenye Google Sheet kupitia Apps Script.
 *
 * Environment variables (Vercel > Project > Settings > Environment Variables):
 *   SHEET_WEBHOOK_URL  - URL ya Apps Script web app (inaishia /exec)
 *   SHEET_SECRET       - neno la siri lilelile lililowekwa kwenye Code.gs
 */
const SURVEY = require('../survey-config.js');

const MAX_TEXT = 2000;
const MAX_SHORT = 120;

const questions = SURVEY.sections.reduce((all, s) => all.concat(s.questions), []);

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function isShown(q, answers) {
  return !q.showIf || answers[q.showIf.id] === q.showIf.equals;
}

/* Returns { errors: [...ids], values: {id: value} } with only trusted, whitelisted values. */
function validate(input) {
  const a = input && typeof input === 'object' ? input : {};
  const out = {};
  const errors = [];

  for (const q of questions) {
    if (!isShown(q, out)) continue; // hidden question: ignore whatever was sent
    const raw = a[q.id];
    let ok = true;

    switch (q.type) {
      case 'single':
        if (q.options.includes(raw)) out[q.id] = raw;
        else ok = false;
        break;
      case 'yesno':
        if (raw === SURVEY.yes || raw === SURVEY.no) out[q.id] = raw;
        else ok = false;
        break;
      case 'multi': {
        const picked = Array.isArray(raw) ? q.options.filter((o) => raw.includes(o)) : [];
        if (picked.length) out[q.id] = picked;
        else ok = false;
        if (q.other && picked.includes(q.other)) out[q.id + '_other'] = clean(a[q.id + '_other'], MAX_SHORT);
        break;
      }
      case 'scale':
        if (Number.isInteger(raw) && raw >= 1 && raw <= 5) out[q.id] = raw;
        else ok = false;
        break;
      case 'nps':
        if (Number.isInteger(raw) && raw >= 0 && raw <= 10) out[q.id] = raw;
        else ok = false;
        break;
      case 'matrix': {
        const m = raw && typeof raw === 'object' ? raw : {};
        const vals = {};
        for (const item of q.items) {
          const v = m[item.id];
          if (Number.isInteger(v) && v >= 1 && v <= 5) vals[item.id] = v;
          else ok = false;
        }
        out[q.id] = vals;
        break;
      }
      case 'text': {
        const t = clean(raw, MAX_TEXT);
        if (t) out[q.id] = t;
        else ok = false;
        break;
      }
      case 'name': {
        const t = clean(raw, MAX_SHORT);
        if (t) out[q.id] = t;
        else ok = false;
        break;
      }
      case 'phone': {
        const t = clean(raw, 30);
        if (!t) { ok = false; break; }
        const digits = t.replace(/\D/g, '');
        if (/^\+?[\d\s()-]+$/.test(t) && digits.length >= 9 && digits.length <= 15) out[q.id] = t;
        else { errors.push(q.id); ok = true; } // given but malformed: always an error
        break;
      }
    }

    if (!ok && q.required) errors.push(q.id);
  }
  return { errors, values: out };
}

/* One fixed column order, so every response lands in the same columns. */
function toRow(values) {
  const headers = ['Muda wa kutuma'];
  const row = [
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Africa/Dar_es_Salaam', dateStyle: 'short', timeStyle: 'medium'
    }).format(new Date())
  ];
  const textCols = []; // 0-based columns that must stay plain text (phone numbers)

  for (const q of questions) {
    const label = q.n + '. ' + q.text;
    const v = values[q.id];
    if (q.type === 'matrix') {
      for (const item of q.items) {
        headers.push(q.n + '. ' + item.text);
        row.push(v && v[item.id] != null ? v[item.id] : '');
      }
    } else if (q.type === 'multi') {
      headers.push(label);
      row.push(v ? v.join('; ') : '');
      if (q.other) {
        headers.push(q.n + '. ' + q.other + ' (taja)');
        row.push(values[q.id + '_other'] || '');
      }
    } else {
      if (q.type === 'phone') textCols.push(headers.length);
      headers.push(label);
      row.push(v != null ? v : '');
    }
  }
  return { headers, row, textCols };
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'body' });

  // Honeypot: real people never fill this hidden field. Pretend success, store nothing.
  if (body.website) return res.status(200).json({ ok: true });

  const { errors, values } = validate(body.answers);
  if (errors.length) return res.status(422).json({ ok: false, error: 'validation', fields: errors });

  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_SECRET;
  if (!url || !secret) {
    console.error('SHEET_WEBHOOK_URL or SHEET_SECRET is not set');
    return res.status(500).json({ ok: false, error: 'config' });
  }

  try {
    const payload = Object.assign({ secret }, toRow(values));
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: AbortSignal.timeout(20000)
    });
    const text = await r.text();
    let result = null;
    try { result = JSON.parse(text); } catch (e) { /* Google returned an HTML page */ }
    if (!result || result.ok !== true) {
      console.error('Sheet rejected the response:', r.status, text.slice(0, 300));
      return res.status(502).json({ ok: false, error: 'sheet' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Could not reach the sheet:', err && err.message);
    return res.status(502).json({ ok: false, error: 'sheet' });
  }
}

module.exports = handler;
module.exports.validate = validate;
module.exports.toRow = toRow;
