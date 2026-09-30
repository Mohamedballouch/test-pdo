import './style.css';
import { EXAMPLE, calculate, normalizeInputs, formatMAD, formatHours, formatPayback, buildSummary } from './calc.js';

const FIELDS = Object.keys(EXAMPLE);
const form = document.getElementById('calc-form');
const $ = (id) => document.getElementById(id);

function readInputs() {
  const raw = {};
  for (const key of FIELDS) raw[key] = form.elements[key].value;
  return raw;
}

function isExample(raw) {
  return FIELDS.every((key) => String(raw[key]).trim() === String(EXAMPLE[key]));
}

function render() {
  const raw = readInputs();
  const inputs = normalizeInputs(raw);
  const r = calculate(inputs);

  $('result-name').textContent = inputs.name;
  $('out-hours').textContent = formatHours(r.annualHoursSaved);
  $('out-gross').textContent = formatMAD(r.annualGrossSavings);
  $('out-net').textContent = formatMAD(r.firstYearNetBenefit);
  $('out-net').classList.toggle('negative', r.firstYearNetBenefit < 0);
  $('out-payback').textContent = formatPayback(r.paybackMonths);
  $('out-payback').classList.toggle('muted', r.paybackMonths === null);

  // The "illustrative" label stays visible while any example value is still in use.
  const example = isExample(raw);
  $('example-badge').textContent = example ? 'Illustrative example values' : 'Your estimates';
  $('example-notice').hidden = !example;
}

function fillExample() {
  for (const key of FIELDS) form.elements[key].value = EXAMPLE[key];
  render();
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('Copy command was rejected');
}

let statusTimer;
function showStatus(message) {
  const status = $('copy-status');
  status.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => (status.textContent = ''), 2500);
}

form.addEventListener('input', render);
form.addEventListener('submit', (e) => e.preventDefault());
$('reset-button').addEventListener('click', fillExample);
$('copy-button').addEventListener('click', async () => {
  try {
    await copyText(buildSummary(readInputs()));
    showStatus('Copied!');
  } catch {
    showStatus('Could not copy — please copy manually.');
  }
});

fillExample();
