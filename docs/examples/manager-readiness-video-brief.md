# AI Use-Case Calculator: Readiness Note

**Recommendation: Ready for an internal demo.** All automated checks passed and the app builds cleanly. It has not been deployed. Run it locally for the demo.

## What it helps decide
It helps a team judge whether an AI use case is worth funding. You enter how many people do a task, the hours they spend on it each week, their hourly cost, the expected adoption rate, and the implementation and operating costs. The calculator then estimates annual hours saved, gross savings, first-year net benefit, and how many months it takes to pay back the cost.

## Evidence
- **Tests:** 43 of 43 passed across 2 test files (35 on the calculations, 8 on the screen behaviour). The run took about 0.6 seconds on Node v24.21.0.
- **Build:** The production build succeeded in 40 ms. The output is small, about 15 kB before compression.
- **Repository snapshot:** Branch `pdo/run-20261001-145522-673891b`, latest commit `c200866`, 39 tracked files. The snapshot includes the calculator app and its onboarding docs.
- **Not checked:** Nobody tested the app by hand on screen or in a browser during this run.

## Honest caveats
1. **Illustrative assumptions.** The starting example ("Customer meeting summaries": 20 people, 2 hours a week, 70% adoption) is made up to show how the tool works.
2. **No company data.** The tool does not connect to any internal systems. Every figure is typed in by the user.
3. **ROI is an estimate.** The results are only as good as the inputs. They do not account for ramp-up time, quality effects or risk.

## Five-minute demo
1. **(0:00–0:45)** State the question: "Is this AI use case worth funding?"
2. **(0:45–2:00)** Open the app with the built-in example and walk through the results: hours saved, savings, first-year net benefit, payback.
3. **(2:00–3:15)** Change one input live, such as lowering adoption to 40%, and show how the payback period moves.
4. **(3:15–4:15)** Show the evidence: 43 of 43 tests passed and the build is clean.
5. **(4:15–5:00)** Read out the three caveats and ask the room which real use case to model next.
