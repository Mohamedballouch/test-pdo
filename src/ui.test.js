// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const bodyHtml = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '');

const $ = (id) => document.getElementById(id);
function setValue(id, value) {
  const el = $(id);
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('UI', () => {
  beforeEach(async () => {
    document.body.innerHTML = bodyHtml;
    vi.resetModules();
    await import('./main.js');
  });

  it('opens with the illustrative example and its results', () => {
    expect($('name').value).toBe('Customer meeting summaries');
    expect($('example-badge').textContent).toMatch(/Illustrative example/);
    expect($('example-notice').hidden).toBe(false);
    expect($('out-hours').textContent).toBe('1,288 hours');
    expect($('out-gross').textContent).toBe('193,200 MAD');
    expect($('out-net').textContent).toBe('109,200 MAD');
    expect($('out-payback').textContent).toBe('4.3 months');
  });

  it('shows every assumption with a label and help text', () => {
    for (const id of ['name', 'people', 'hoursPerWeek', 'weeksPerYear', 'hourlyCost', 'adoptionPercent', 'implementationCost', 'operatingCost']) {
      const label = document.querySelector(`label[for="${id}"]`);
      expect(label, id).not.toBeNull();
      expect(label.parentElement.querySelector('small'), id).not.toBeNull();
    }
  });

  it('updates results immediately when inputs change', () => {
    setValue('people', '40');
    expect($('out-hours').textContent).toBe('2,576 hours');
    expect($('example-notice').hidden).toBe(true);
    setValue('name', 'Invoice triage');
    expect($('result-name').textContent).toBe('Invoice triage');
  });

  it('handles cleared fields without NaN', () => {
    for (const id of ['people', 'hoursPerWeek', 'hourlyCost', 'implementationCost', 'operatingCost']) setValue(id, '');
    const text = document.querySelector('.results').textContent;
    expect(text).not.toMatch(/NaN|undefined|Infinity/);
    expect($('out-payback').textContent).toBe('No payback under these assumptions');
  });

  it('shows no payback when operating cost exceeds savings', () => {
    setValue('operatingCost', '200000');
    expect($('out-payback').textContent).toBe('No payback under these assumptions');
  });

  it('has an expandable "How this is calculated" section', () => {
    const details = document.querySelector('details.how');
    expect(details.querySelector('summary').textContent).toBe('How this is calculated');
  });

  it('copies the summary to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    $('copy-button').click();
    await vi.waitFor(() => expect($('copy-status').textContent).toBe('Copied!'));
    expect(writeText.mock.calls[0][0]).toContain('Customer meeting summaries');
  });

  it('resets to the example', () => {
    setValue('people', '5');
    $('reset-button').click();
    expect($('people').value).toBe('20');
    expect($('example-notice').hidden).toBe(false);
  });
});
