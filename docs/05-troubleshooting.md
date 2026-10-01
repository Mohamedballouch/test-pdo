# 5. Troubleshooting and recovery

Use these checks in **Ubuntu**, where the PDO daemon, Claude Code, GitHub CLI, and repository are installed. The [installation guide](01-install-and-connect.md) has the full commands and official sources.

| Symptom | Check and fix |
| --- | --- |
| PDO page says **Could not reach the daemon** | Start **pdo daemon** in Ubuntu and leave that terminal open. Reload http://localhost:5172. Verify the footer says **Daemon: connected**. If PDO was installed as a service, check **pdo service status** instead. |
| PDO says **Author identity unknown**, **empty ident name**, or a Git commit fails | In the target repository, run **git config user.name** and **git config user.email**. If either is empty, set them with **git config --global user.name "Your Name"** and **git config --global user.email "you@example.com"**, or use **--local** in this repository. Then retry the failed run/node as appropriate; editing identity does not repair a failed commit by itself. |
| The GitHub issue reader cannot fetch a ticket | Run **gh auth status**, **git -C ~/test-pdo remote -v**, and **gh issue view 1 --repo Mohamedballouch/test-pdo**. Make sure the prompt identifies the issue by number or URL and the account can read that repository. |
| A Jira-reading node cannot find or access its ticket | In the same Ubuntu account, open Claude Code and check **/mcp** for the Atlassian connection. Try a read-only lookup of the key, then inspect the PDO node's **Terminal**. Follow the [Jira connection guide](09-jira-and-ticket-integration.md). |
| A Git push asks for a password or fails authentication | In Ubuntu, run **gh auth status** and **gh auth setup-git**. Check that **git remote -v** points to the correct repository. |
| Claude Code asks to sign in or trust a directory | Run **claude auth status** in Ubuntu. Open **claude** from the target repository root and complete its login/trust prompt. If this occurs during a run, inspect the node's **Terminal** in PDO. |
| A model name is rejected | In **Settings → Agents**, return to **default model**, or select a model supported by the installed harness and account. A model in PDO does not grant provider access. |
| New Run cannot validate Target repository | Run **pwd** and **git status** from the clone in Ubuntu. Enter that absolute Linux path, not a Windows path. Make sure the folder is a Git repository and the daemon can access it. |
| The expected pipeline is missing | Open **Pipelines** and refresh. If imported from files, confirm the YAML and matching **.prompts** directory are together under ~/.pdo/pipelines. Inspect the pipeline in the UI before launching. |
| A node does not advance | Open the node inspector and check **Terminal**, **Inputs**, **Outputs**, and **Initial Prompt**. It may be waiting for a sign-in, a trust question, a required output, or a human answer. If the node uses **pdo wait-user**, answer through the waiting UI/terminal. |
| A node reports **pdo complete refused** | Read the exact refusal in its terminal. Usually the required output file, frontmatter verdict, or human release is missing. Fix the named condition and call **pdo complete** again in that node session. |
| Diff is unavailable on an archived run | PDO preserved the node outputs but not the archived run's Diff in the observed version. Review and save the Diff **before** archiving; also inspect the Git branch/PR if it is still present. |
| The calculator will not start or npm resolves to Windows | Install Linux Node.js in Ubuntu as in [Step 6](01-install-and-connect.md). Check **command -v node** and **command -v npm**; neither should point under /mnt/c. Run **npm ci**, then **npm run dev** from the calculator branch. |
| Port 5173 is busy | Stop the other app on port 5173, then start the calculator again. This demo pins 5173 and will not silently switch ports. PDO uses 5172. |
| Sandbox choices show **Docker unavailable** | The Docker binary can be present while the Docker daemon is unreachable. For this first local run, leave **Sandbox** at the instance default **off**. Set up Docker separately only if you need container isolation. |
| A run shows a suspicious zero cost | Cost is an estimate, not a bill. The observed Claude model in issue #1 was unpriced in this PDO version, so the displayed zero is a **lower bound**. Check actual usage/billing with the provider. |

## A short diagnostic sequence

~~~bash
pdo --version
claude --version
claude auth status
gh auth status
git -C ~/test-pdo status --short --branch
git -C ~/test-pdo remote -v
git -C ~/test-pdo config user.name
git -C ~/test-pdo config user.email
curl -I http://localhost:5172/
~~~

Do not paste the output of **gh auth token**, API keys, or private configuration files into a GitHub issue or public chat. The commands above check readiness without printing a token.

If a run fails, write down its run ID and the node's exact error message. Inspect the failed node and the preceding node's output before restarting; repeated launches create separate runs and worktrees.
