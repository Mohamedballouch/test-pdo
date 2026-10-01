# AI Use-Case Value Calculator

A small single-page web app that helps a manager estimate the value of automating a repetitive task
(for example, preparing customer meeting summaries). Every figure is an **estimate** computed from
assumptions the user can see and change. Nothing leaves the browser.

## PDO onboarding and walkthrough

This repository also contains a step-by-step guide for running a GitHub issue through Prompt Driven Orchestrator (PDO) in Ubuntu on Windows:

1. [Install PDO, Claude Code, GitHub CLI, and clone this repo](docs/01-install-and-connect.md)
2. [Configure the agent, model, and keys](docs/02-agents-and-keys.md)
3. [Run a GitHub issue and inspect its results](docs/03-github-issue-to-run.md)
4. [Create or adapt a multi-step pipeline](docs/04-pipelines.md)
5. [Troubleshoot common errors](docs/05-troubleshooting.md)

[Watch the PDO UI walkthrough](docs/assets/pdo-ui-walkthrough.webm), [watch the calculator demo](docs/assets/calculator-demo.webm), or inspect the [portable issue-to-demo pipeline](docs/examples/issue-to-demo.yaml). The real example uses [issue #1](https://github.com/Mohamedballouch/test-pdo/issues/1). PDO runs on http://localhost:5172; the calculator app below runs on http://localhost:5173.

## Features

- Editable use-case name and assumptions: people affected, hours saved per person per week, working
  weeks per year, hourly cost (MAD), expected adoption rate (%), one-time implementation cost (MAD),
  annual operating cost (MAD).
- Results update instantly: annual hours saved, annual gross savings, first-year net benefit and
  estimated payback time.
- Opens with an example that is clearly labelled **illustrative**, and can be reset to it.
- **Copy summary** copies a short, plain-language business case to the clipboard.
- An expandable **How this is calculated** section explains the formulas.
- Responsive layout (two columns on desktop, stacked on mobile).

## Setup

Prerequisites: Node.js 24 LTS recommended (the installed Vitest also supports Node.js 22.12+ or 26+).

```bash
npm ci
```

## Run

```bash
npm run dev
```

Open <http://localhost:5173>. The port is pinned to **5173** with `strictPort`, so the app fails
instead of silently moving to another port. This keeps it clear of PDO on 5172.

Production build and preview (also on port 5173):

```bash
npm run build
npm run preview
```

## Test

```bash
npm test
```

Runs the Vitest suites:

- `src/calc.test.js`: formulas, edge cases (zero, empty, negative and non-numeric inputs, zero costs,
  savings equal to or below operating cost), MAD formatting, payback text and the copied summary.
- `src/ui.test.js`: DOM behaviour in jsdom (initial example, live updates, cleared fields, no-payback
  message, "How this is calculated" section, copy button, reset).

## Demo script

1. Run `npm run dev` and open <http://localhost:5173>.
2. The page shows the illustrative **Customer meeting summaries** example: 20 people, 2 h/week,
   46 weeks, 150 MAD/h, 70% adoption, 60,000 MAD implementation and 24,000 MAD/year operating cost.
   The results show 1,288 hours, 193,200 MAD gross savings, 109,200 MAD first-year net benefit and a
   payback time of 4.3 months.
3. Change **People affected** to 40. All four results update immediately and the badge switches to
   "Your estimates".
4. Set **Annual operating cost** to 400000. Payback now reads **No payback under these assumptions**
   and the net benefit turns negative.
5. Clear any field. It counts as 0 and nothing shows `NaN`.
6. Expand **How this is calculated** to see the formulas.
7. Click **Copy summary** and paste the text into an email.
8. Click **Reset to illustrative example** to start over.

## How it is calculated

| Result                 | Formula                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| Annual hours saved     | people × hours saved per week × working weeks × adoption rate            |
| Annual gross savings   | annual hours saved × hourly cost                                         |
| First-year net benefit | annual gross savings − annual operating cost − implementation cost       |
| Payback time (months)  | implementation cost ÷ (annual gross savings − annual operating cost) × 12 |

- If annual gross savings do not exceed the annual operating cost, payback is shown as
  **No payback under these assumptions**.
- If there is no implementation cost (and savings exceed operating cost), payback is **Immediate**.
- Empty, non-numeric and negative inputs count as 0. Adoption is capped at 100%.
- Amounts are in Moroccan dirham (MAD), rounded to the nearest dirham (e.g. `193,200 MAD`).

## Project layout

```
index.html          page markup
src/calc.js         pure calculation, formatting and summary logic
src/main.js         DOM wiring (live updates, copy, reset)
src/style.css       responsive styles
src/*.test.js       Vitest suites
vite.config.js      dev/preview server pinned to port 5173
```

## Out of scope

User accounts, real financial data, external APIs and AI-generated estimates.
