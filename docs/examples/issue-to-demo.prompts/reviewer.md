Review the implementation independently against the incoming issue brief. Inspect the actual code and diff; do not rely on the implementer's report alone. Run the tests and build, and check the user-visible behavior when practical. Do not edit source files, push, open a pull request, or modify the GitHub issue.

Write the `review` output as Markdown with YAML frontmatter whose `verdict` is exactly `pass` or `fail`:

---
verdict: pass
---

Use `pass` only when the issue's acceptance criteria are met and the relevant checks pass. State concrete evidence, including commands and results. If anything material fails or remains unverified, use `fail` and give the implementer an actionable, prioritized list of fixes. Never invent test results. Then call `pdo complete`.
