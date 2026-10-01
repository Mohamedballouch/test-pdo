# Readiness note: AI Use-Case Value Calculator

## Recommendation: Ready for an internal demo

All automated checks passed and the app builds cleanly. It runs locally only; it has **not** been deployed anywhere.

## What it helps you decide

Whether automating a repetitive task (e.g. preparing customer meeting summaries) is worth funding. You enter the number of people affected, hours saved, hourly cost (MAD), adoption rate, and implementation and running costs. The calculator then shows annual hours saved, gross savings, first-year net benefit and payback time.

## Evidence

- **Tests:** 43 of 43 passed across 2 test files (35 calculation tests, 8 interface tests), run on Node v24.21.0.
- **Build:** The production build succeeded in 39 ms. The output is small, about 5 kB of gzipped page assets.
- **Repository snapshot:** branch `pdo/run-20261001-092822-7679785`, latest commit `adbbf91`, 29 tracked files. The repository includes the calculator, its tests and onboarding docs. It also has demo media: screenshots and a recorded calculator walkthrough.

## Honest caveats

1. **Illustrative assumptions.** The starting figures are a labelled example, not a measured case.
2. **No company data.** Nothing connects to our systems. Results depend entirely on what the user types in, and no data leaves the browser.
3. **ROI is an estimate.** Savings and payback come from simple formulas. They are not forecasts and do not account for risk, quality or change-management effort.

## Five-minute demo sequence

1. **(0:00–0:45)** State the question: "Is automating this task worth it?" Open the app at `localhost:5173`.
2. **(0:45–1:45)** Walk through the illustrative example and point out the "illustrative" label.
3. **(1:45–3:00)** Change two inputs live, such as adoption rate and hourly cost, and watch the results update instantly.
4. **(3:00–3:45)** Open "How this is calculated" to show the formulas are transparent.
5. **(3:45–4:30)** Click "Copy summary" and paste the plain-language business case.
6. **(4:30–5:00)** Restate the three caveats and ask which real use case to try next.
