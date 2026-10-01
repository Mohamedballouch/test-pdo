Read the GitHub issue identified in the incoming task. Use the Linux `gh` CLI to read the full issue body and comments. The repository remote identifies the GitHub repository; do not assume the issue number is unique outside this repository.

Do not edit source files or change the GitHub issue. Write a Markdown brief to the `brief` output path from the PDO Runtime Preamble. Include:

- Issue number, title, URL, and the user's requested outcome.
- Every acceptance criterion, preserving important wording.
- A concise implementation plan and the checks needed to prove it works.
- Any missing information that prevents a sound implementation.

If the issue cannot be fetched, explain the precise error and ask for help with `pdo wait-user`; do not invent the ticket. When the brief is ready, call `pdo complete`.
