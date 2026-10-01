# 1. Install PDO and connect Ubuntu, Claude Code, and GitHub

This guide is for Windows with Ubuntu under WSL, using [test-pdo](https://github.com/Mohamedballouch/test-pdo). Run every Linux command below **inside the Ubuntu terminal**. Only the first WSL command is run in Windows PowerShell. Windows and Ubuntu have separate installations, PATHs, and credentials. If you already completed a step, use its check command and move on.

## The pieces

| Piece | Purpose | Needed? |
| --- | --- | --- |
| WSL Ubuntu | The environment where PDO and the repository run | Yes, for this guide |
| Git and tmux | PDO worktrees and agent terminal sessions | Yes |
| PDO | Local UI and run orchestrator at http://localhost:5172 | Yes |
| Claude Code | The agent that performs the pipeline work | One authenticated agent is required; Claude is this example |
| GitHub CLI (gh) | Allows an agent to read issues and lets you push a branch or open a PR | Yes for the issue workflow |
| Node.js and npm | Runs the calculator demo on port 5173 | Only for this demo app |

An Anthropic API key is **not** required when you sign Claude Code in with an eligible Claude account. GitHub CLI browser sign-in also avoids manually creating a personal access token. The two sign-ins are separate.

## Step 0 — Check Ubuntu

In Windows PowerShell:

~~~powershell
wsl --list --verbose
~~~

Use your existing Ubuntu installation. If Ubuntu is missing, follow [Microsoft's WSL installation guide](https://learn.microsoft.com/en-us/windows/wsl/install); for a new installation the command is:

~~~powershell
wsl --install -d Ubuntu-24.04
~~~

Open **Ubuntu** from the Start menu. The following commands belong there. Confirm that the prompt is a Linux prompt, not PS C:\.

## Step 1 — Install basic tools

~~~bash
sudo apt update
sudo apt install -y git tmux curl ca-certificates wget
git --version
tmux -V
~~~

Keep the Git clone under your Ubuntu home directory (for example, /home/mohamed_ballouch/test-pdo), rather than under /mnt/c, so the agent and Git worktrees use the same Linux filesystem.

## Step 2 — Install and start PDO

Use the [PDO release installer](https://github.com/Loulen/prompt-driven-orchestrator#install):

~~~bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/Loulen/prompt-driven-orchestrator/releases/latest/download/pdo-daemon-installer.sh | sh
pdo --version
pdo daemon
~~~

Keep that terminal open. Open [http://localhost:5172](http://localhost:5172) in a Windows browser. The footer should say **Daemon: connected**. PDO's UI runs locally; this does not publish your repository or app.

To keep PDO running across terminal closes, use **pdo service install** after confirming WSL systemd is enabled; check with **ps -p 1 -o comm=** (it should say systemd). See [PDO's CLI reference](https://github.com/Loulen/prompt-driven-orchestrator/blob/main/docs/reference/cli.md) for service commands. For the first demo, keeping **pdo daemon** in a terminal is enough.

Open a **second Ubuntu terminal** for the remaining commands.

## Step 3 — Install and sign in to Claude Code

Use the [official Claude Code Linux/WSL installer](https://code.claude.com/docs/en/setup):

~~~bash
curl -fsSL https://claude.ai/install.sh | bash
~~~

Open a new Ubuntu terminal so the PATH refreshes, then check:

~~~bash
command -v claude
claude --version
claude doctor
~~~

Start **claude** once and follow its browser sign-in. A Claude Pro, Max, Team, Enterprise, or Console account is required; a free claude.ai account does not include Claude Code. Afterwards:

~~~bash
claude auth status
~~~

This example uses the Claude account sign-in. If you intentionally use Anthropic Console billing instead, follow [Claude Code authentication](https://code.claude.com/docs/en/authentication) and configure that account in Claude Code. Do not paste an API key into PDO's prompt, a pipeline file, GitHub issue, or this repository.

## Step 4 — Install GitHub CLI and sign in

Use the [official GitHub CLI Ubuntu package instructions](https://github.com/cli/cli/blob/trunk/docs/install_linux.md):

~~~bash
sudo mkdir -p -m 755 /etc/apt/keyrings
wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
sudo apt update
sudo apt install -y gh
gh --version
~~~

Choose GitHub.com and HTTPS during browser sign-in:

~~~bash
gh auth login --web --git-protocol https
gh auth status
gh auth setup-git
~~~

The browser sign-in authorizes the **gh** program. **gh auth setup-git** also makes Git use that login for HTTPS pushes. Read the scopes shown by **gh auth status**; the issue workflow needs repository access. See [GitHub's login reference](https://cli.github.com/manual/gh_auth_login).

## Step 5 — Clone and identify your repository

~~~bash
cd ~
git clone https://github.com/Mohamedballouch/test-pdo.git
cd ~/test-pdo
git remote -v
git status --short --branch
pwd
~~~

The **origin** remote is the connection to GitHub. PDO does not require a separate GitHub API key or a GitHub account field in Settings for this workflow. The **Target repository** field in New Run points to the Ubuntu clone, and a GitHub issue URL goes in the run prompt.

If the repository is already cloned, do not clone it again. Run the last four commands from the existing clone.

Set a Git author identity before the first PDO run, or PDO may fail when it commits the agent's work:

~~~bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global --get user.name
git config --global --get user.email
~~~

Use the name and email you want attached to commits. To set them only for this repository, replace **--global** with **--local** while inside ~/test-pdo.

Trust the repository root once in the agent:

~~~bash
cd ~/test-pdo
claude
~~~

If Claude asks whether to trust or approve this directory, review the path and approve it. Exit Claude after the trust check. PDO's run worktrees sit underneath this repository and inherit that approval.

Check that the issue is accessible:

~~~bash
gh issue view 1 --repo Mohamedballouch/test-pdo
~~~

## Step 6 — Optional: run the calculator app locally

The demo app needs Linux Node.js and npm. If **node --version** or **npm --version** fails in Ubuntu, install Node with [nvm's official instructions](https://github.com/nvm-sh/nvm#installing-and-updating):

~~~bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
~~~

Open a new Ubuntu terminal, then:

~~~bash
nvm install --lts
nvm alias default 'lts/*'
node --version
npm --version
~~~

Make sure **command -v node** and **command -v npm** point into Ubuntu, not /mnt/c/Program Files/nodejs. In the branch containing the calculator:

~~~bash
cd ~/test-pdo
npm ci
npm test
npm run build
npm run dev
~~~

Open [http://localhost:5173](http://localhost:5173). Port 5172 is PDO; port 5173 is the calculator. If your clone is still on **main**, switch to the reviewed calculator branch or merge its pull request first; the app is not on main until that happens.

## Quick readiness check

~~~bash
command -v pdo
command -v claude
command -v gh
git -C ~/test-pdo remote -v
git -C ~/test-pdo config user.name
git -C ~/test-pdo config user.email
claude auth status
gh auth status
~~~

Keep credentials in the tools' own auth configuration and protect your Ubuntu account. GitHub CLI can fall back to a local plaintext file if no system credential store is available. The repository should contain instructions, prompts, and source code, never tokens or private key files.

Next: [configure agents and alternatives](02-agents-and-keys.md), then [create and inspect a run](03-github-issue-to-run.md).
