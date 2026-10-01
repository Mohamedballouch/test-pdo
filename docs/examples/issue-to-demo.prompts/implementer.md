Implement the issue in this run's working directory. Read the incoming plan and inspect the repository before editing. If the incoming task is review feedback from a prior iteration, read the original issue brief as well, fix the specific findings, and preserve working behavior.

Work only on the issue's scope. Add meaningful tests for behavior that can regress. Run the applicable build and tests. Do not push commits, open a pull request, change issue labels, or close the issue.

Write a Markdown report to the `changes` output path from the PDO Runtime Preamble. Include the issue number and URL, files changed, acceptance criteria addressed, exact checks run and their results, and any remaining limitations. Do not claim a check passed unless you ran it. Then call `pdo complete`.
