# 7. PDO functions, configuration, and where PDSF fits

This guide is a map of **Prompt Driven Orchestrator (PDO)** for someone setting up the Windows/Ubuntu demo or explaining it to a colleague. It describes the PDO **v1.110.0** instance used for this repository. Check `pdo --version` on your own machine: later releases can move or rename controls. For the exact install commands, start with [Install and connect](01-install-and-connect.md); for a run you can replay, use the [hands-on demonstration](06-hands-on-pipeline-demo.md) and its [MP4 demo page](http://localhost:5172/pages/pdo-guide/videos.html).

## The four pieces

| Piece | Job | Where you set it up |
| --- | --- | --- |
| **GitHub** | Stores the repository, issues, branches, and pull requests | GitHub website; `git` and `gh` in Ubuntu |
| **PDSF** (optional) | Gives the team a method and reusable skills for turning business needs into reviewed implementation tickets | Installed into the project, or selected skills imported into PDO |
| **PDO** | Runs a saved, visible sequence of steps against a local Git checkout; records outputs and review evidence | PDO UI at `http://localhost:5172` and `~/.pdo` in Ubuntu |
| **Agent harness** | Supplies an AI coding agent for Agent nodes (Claude Code in this demo) | Install and sign in to Claude Code in the **same Ubuntu user** that runs PDO |

The working path for this demo is **GitHub issue → local clone → PDO run → node reports and code branch → human review → GitHub pull request**. PDSF can help shape the issue, specification, tests, and review method before and during that run. PDO does not automatically install or execute PDSF, and neither tool grants GitHub or model access by itself.

## What PDO can do

| Area in PDO | What you do there | What you get |
| --- | --- | --- |
| **Pipelines / Library** | Draw and save a reusable graph of jobs; import or export its YAML and prompt files; use the template's Assistant to help author it | A repeatable process that can run against different repositories or requests |
| **Runs → New Run** | Choose a local repository, source branch, pipeline, input prompt, agent, skills, and optional sandbox or attachments | One execution with its own Git worktree and branch |
| **Run canvas** | Watch each node move from ready to running to completed, failed, or waiting | A live view of what is happening and where attention is needed |
| **Node inspector** | Open inputs, outputs, initial prompt, terminal, and status for a selected node | Evidence of what that step received, did, and handed to the next step |
| **Run Info / Diff / YAML** | Check source branch and timing, inspect changed files, and read the exact pipeline snapshot | A reviewable result before you publish code |
| **Manager and review** | Ask the run's optional manager to discuss work; leave line comments in the Diff and send them to the manager | A recorded review conversation and a path to request fixes |
| **Triggers** | Schedule a pipeline on a UTC cron expression, optionally after a guard script | Repeated runs when the guard says there is work |
| **Projects** | Group local repositories and give them common agent and skill choices | Shared defaults for related codebases |
| **Settings / Stats** | Set instance defaults and view run, session, cost, and performance summaries | A consistent setup and visibility into use and failures |

PDO also provides a **Skill bank**, Docker-backed sandbox profiles, worktree provisioning, multi-repository runs, live terminals, guided tours, page mounts for local reports, and a CLI. The [PDO feature reference](https://github.com/Loulen/prompt-driven-orchestrator/blob/v1.110.0/docs/features.md) describes these in depth; the [CLI reference](https://github.com/Loulen/prompt-driven-orchestrator/blob/v1.110.0/docs/reference/cli.md) lists commands.

For larger work, a run can have one primary repository plus secondary repository snapshots; each secondary can be writable or read-only. **Worktree provisioning** copies or links files that Git does not carry into a new worktree, such as a local tool configuration. A **sandbox profile** runs nodes in a Docker image you supply and stages the supported harness configuration into it. None of these is needed for the first calculator demo. PDO's guided tour uses a disposable tutorial repository, while **page mounts** serve local HTML reports and prototypes through the daemon.

You can edit a pipeline while its run is active: a node already executing keeps its current work, and the scheduler reads the revised graph for later steps. Use that carefully and inspect the run's YAML snapshot. The Diff review can compare the run's fork point, node boundaries, live worktree, or tip, and lets you leave inline comments on changed lines.

### The node choices on a pipeline canvas

**Start** receives the run input and **End** collects the final result. Between them you choose work nodes:

| Node | Use it when | Example in this repository |
| --- | --- | --- |
| **Agent** | An AI agent must read, reason, write, or make a judgment | Claude Code writes the manager readiness brief |
| **Script** | A repeatable command can check or transform something without an LLM | List repository facts; run 43 tests and a production build |
| **Merge** | Parallel work nodes edit separate worktrees and their Git changes need to be joined, with a conflict resolver if necessary | Useful in larger code-editing pipelines; the read-only demo only joins the two reports as Agent inputs |

An Agent node can have a **role prompt**, a harness/model/profile, skills, and named input/output ports. A Script node has its command and ports. Edges carry named outputs between nodes. PDO checks declared outputs before moving downstream: a missing required file or invalid frontmatter fails the handoff. Choose an output type that matches the result: Markdown, files, HTML, or an image list.

For decisions, an edge can test a structured field such as `verdict: pass` or `verdict: fail`; it can also use numeric comparisons or an `else` path. A review failure can return to an earlier node in a **bounded loop** with a maximum iteration count. Collection loops can process a list in parallel. These routes are configured in the graph rather than decided invisibly by the language model. Use **Interactive** for a node that may ask you a question, and **Orchestrator** when a node must launch and wait for child pipelines.

The [manager-readiness-demo pipeline](examples/manager-readiness-demo.yaml) shows a simple but useful five-node pattern: Start sends the same request to two Script nodes in parallel; their `facts` and `checks` outputs feed one Claude Agent; the Agent's `brief` reaches End. The [issue-to-demo pipeline](examples/issue-to-demo.yaml) shows an issue reader, implementer, reviewer, bounded repair path, and final demo brief. You can copy either example into `~/.pdo/pipelines/` together with its matching `.prompts` directory.

### What happens during and after a run

PDO makes an isolated Git worktree and branch for a run. Work nodes can use their own isolated sub-worktrees or a shared run worktree, according to their setting. In the Run view, click **each node** and inspect **Inputs**, **Outputs**, **Terminal**, and **Initial Prompt**. For an Agent output, read the artifact itself; a green node only says it completed its defined handoff. The live terminal lets you see or answer a session; an agent can explicitly signal **awaiting you**.

The Run controls can pause or resume execution, retry a failed node, open a shell in the run worktree, and eventually archive or clean up the run. An **Orchestrator** node can launch child runs, which appear under the parent run and in that node's Orchestration view. Use **Manager** only when you want the optional conversational agent to help with a live run; it is off by default. The Library template's **Assistant** is a separate authoring aid for the pipeline itself.

At the run level, inspect **Info** for its repository and branch, **Diff** for changed files, and **YAML** for the graph that run used. Review the Diff before archiving or cleanup; an archived run may keep outputs while its original Diff surface is unavailable. A completed local run does **not** automatically push, open a pull request, merge, or close a GitHub issue. Publish only after checking the outputs, tests, and source changes.

The screen recording launches the real read-only run **`20261001-145522-673891b`**. Its two checks and Claude brief completed: **43/43 tests passed**, the app built successfully, **0 source files changed**, and the [new brief](examples/manager-readiness-video-brief.md) reached End. An [earlier run's brief](examples/manager-readiness-brief.md) shows how wording and repository counts can change between runs. This evidence applies to those snapshots; rerun checks after changing the source.

## Configuration: where each choice belongs

Follow this order so a failing run is easy to diagnose.

| Step | Action in Ubuntu or PDO | Check |
| --- | --- | --- |
| 1. Runtime | Install `git`, `tmux`, PDO; start `pdo daemon` | `pdo --version`, `tmux -V`, PDO shows **Daemon: connected** |
| 2. AI access | Install Claude Code in Ubuntu and sign in there | `claude --version` and `claude auth status` |
| 3. GitHub access | Install GitHub CLI and sign in separately | `gh auth status` and `gh issue view 1 --repo Mohamedballouch/test-pdo` |
| 4. Git author | Set your name and email for commits | `git config --global --get user.name` and `git config --global --get user.email` |
| 5. Repository | Clone into Ubuntu home and check its remote | `git -C ~/test-pdo remote -v` |
| 6. PDO defaults | Open **Settings → Agents → Harness & models** and choose Claude/default model | Agent choice shown in New Run |
| 7. Workflow | Create or import a pipeline, inspect node prompts, save it | Pipeline appears under Pipelines |
| 8. Execution | In **Runs → New Run**, choose the Ubuntu clone and source branch, pipeline, and request | Run appears in Runs; inspect every result |

### GitHub is a local-tool connection, not a PDO account field

The cloned repository's `origin` remote points to GitHub. `gh auth login` grants GitHub CLI issue/PR access in Ubuntu, and `gh auth setup-git` lets Git use that sign-in for HTTPS pushes. Put a full issue URL in the New Run prompt **only when the pipeline has a node instructed to fetch it** with `gh`; [issue-to-demo](examples/issue-to-demo.yaml) does. PDO has no general “connect GitHub account” field or automatic issue watcher in this version. An issue URL in a prompt is input text, not an OAuth connection or webhook. See the [issue-to-run guide](03-github-issue-to-run.md).

If you later want polling, configure a **Trigger** for the pipeline with a UTC five-field schedule and a guard command that checks GitHub through `gh`. Guard exit status `0` starts a run and its stdout becomes run input; a nonzero status skips that tick. **Test guard** before enabling it. Triggers run only while the daemon is running and do not track which issue was already handled for you, so the workflow needs its own label or other deduplication rule.

### Model and API keys

PDO launches an installed **harness**; it does not sell or host the model. This demo uses Claude Code signed in through its own account, so you do not enter an Anthropic API key into PDO. Console/API billing is another Claude Code authentication option if you choose it. GitHub authentication is independent. Store credentials in the agent's and GitHub CLI's authentication systems, never in an issue, prompt, YAML file, or this repository.

PDO v1.110.0 includes descriptors for **Claude Code, OpenCode, GitHub Copilot CLI, and Pi**. Install and authenticate the one you choose *inside Ubuntu*. Their supported model selection, usage reporting, transcript access, and sandbox staging vary; consult the [harness support matrix](https://github.com/Loulen/prompt-driven-orchestrator/blob/v1.110.0/docs/reference/harnesses.md). [Agents and keys](02-agents-and-keys.md) gives the installation and sign-in path for each. A custom terminal agent needs a descriptor under `~/.pdo/harnesses/descriptors.yaml`.

An **agent profile** saves a harness, model, and effort choice. The effective choice follows **node → run → project → instance**: the most specific explicit setting wins; otherwise it inherits. Set the instance default in **Settings → Agents**, optionally set a project or run override, and use a node override only when that step needs a different agent. A blank/default model leaves the choice to the harness account.

### The Settings pages

| Category | Main controls | First-demo choice |
| --- | --- | --- |
| **General** | Interface, runtime limits, new-run defaults, version/update, tutorials, Stats grouping | Keep defaults; confirm daemon version |
| **Agents** | Harness and models, named profiles, optional Pipeline Manager, instance skills | Claude/default model; leave Manager off until needed |
| **Sandbox & worktrees** | Default Docker sandbox, credential staging profiles, files copied/linked into worktrees | Keep sandbox **off** on this machine, where Docker is unavailable |
| **Diagnostics** | Read-only price table and harness-descriptor status | Check if a custom agent or cost figure looks wrong |

Some Interface and Tutorial preferences live in the current browser. Settings also has sections that save immediately rather than through the main **Save** button; read the label beside each section. The **Stats** page summarizes your runs, sessions, estimated/reported cost, and performance. A missing cost estimate is shown as unavailable, not as zero.

For a skill used in many runs, import it into PDO's **Skill bank** and select it at the instance, project, run, or node tier. PDO combines the selected skills and copies them into each worktree. For a repo-specific practice, put the skill in the project itself. These are two ways to deliver instructions; choose deliberately so an agent gets the expected version.

### Local service and file locations

The first demo needs only `pdo daemon` in an Ubuntu terminal. `pdo service install` is optional when you want it to keep running; in WSL, check that systemd is enabled before relying on that service. The daemon uses port **5172** by default. `pdo daemon --port ... --bind ...` or the `PDO_PORT` and `PDO_BIND` environment variables change its listening address; use the [CLI reference](https://github.com/Loulen/prompt-driven-orchestrator/blob/v1.110.0/docs/reference/cli.md) before changing a service installation. The browser page is a local control surface for the daemon. If you deliberately expose it beyond this machine, follow PDO's [reverse-proxy guide](https://github.com/Loulen/prompt-driven-orchestrator/blob/v1.110.0/docs/reference/reverse-proxy.md) for authentication, TLS, and WebSocket origins.

Reusable instance pipelines live under `~/.pdo/pipelines/`; each YAML file keeps its matching `.prompts` folder. Run worktrees and artifacts live under the target repository's `.pdo/runs/`. A custom harness descriptor belongs at `~/.pdo/harnesses/descriptors.yaml`. `pdo page mount pdo-guide "$PWD/docs"` serves this repository's documentation and videos under `/pages/pdo-guide/`; [the local MP4 page](http://localhost:5172/pages/pdo-guide/videos.html) uses that mount. The repository's Git remote and the agent/GitHub CLI logins are configured in their own tools, outside those PDO files.

## Where PDSF comes in

**Prompt Driven Software Factory (PDSF)** is a separate project method and skill collection. Its sequence is roughly **business need → user stories → design questions → specification → implementation tickets → implementation/tests/review → branch and merge process**. The entry skill `/build-factory` scaffolds the method in a repository; `/verify-factory` checks its health. Other skills include `/to-us`, `/grill-with-docs`, `/to-spec`, `/to-tickets`, `/implement`, `/triage`, and `/git-flow`. [PDSF's README](https://github.com/Loulen/prompt-driven-software-factory) explains the method and [installation guide](https://github.com/Loulen/prompt-driven-software-factory/blob/main/docs/INSTALL.md) explains its files.

Use PDSF **before a PDO run** when a manager's idea is still vague: it helps turn that idea into well-defined work and acceptance criteria. Use PDSF **inside a PDO pipeline** only if you intentionally give the relevant skills to its Agent nodes and write prompts that call for those steps. PDO still owns execution, worktrees, routing, outputs, and inspection. For this small calculator example, the existing GitHub issue and hand-written PDO pipeline were enough; PDSF is **not yet installed in `test-pdo`**.

For example, PDSF can turn a manager's request into business user stories, ask design questions, write a technical specification, and split it into implementable tickets. Once a ticket is ready, PDO can run the implement/review pipeline against it and show every handoff. When the project's Git remote points to GitHub, `/build-factory` can set up GitHub Issues as PDSF's technical backlog; `/verify-factory` checks `gh` authentication and the issue workflow. PDSF needs no separate model or GitHub API key beyond the agent and `gh` logins already described above.

If you want to try PDSF with this Ubuntu checkout, run its published installer **from inside the target repository in Ubuntu**. It changes the repository by adding skills and instruction files, so use a branch and review the resulting diff:

~~~bash
cd ~/test-pdo
git switch -c try-pdsf docs/pdo-onboarding
curl -fsSL https://raw.githubusercontent.com/Loulen/prompt-driven-software-factory/main/install.sh \
  | PDSF_HARNESS=claude PDSF_MONOREPO=n sh
git status --short
~~~

The installer copies `.agents/skills/` and adds a marked block to `AGENTS.md`; for Claude it also links `.claude/skills` and `CLAUDE.md`. Then open Claude Code **from this repository** and invoke `/build-factory` to scaffold the backlog/domain workflow, followed by `/verify-factory` to check it. Review the files and the proposed backlog/branch model for this small `main`-based repo; PDSF can suggest a larger `develop` workflow. Commit the setup files on the source branch before starting a PDO run if you want its new worktree to see them. The installer URL was checked on 1 October 2026; PDSF's installation guide still carries an older warning about a possible 404. You can instead import selected PDSF skills into PDO's Skill bank without installing the full factory into this repo; that gives individual PDO nodes the selected skills but does not scaffold the PDSF project process.

## A five-minute tour to show a manager

1. Open the [MP4 demo page](http://localhost:5172/pages/pdo-guide/videos.html). In the first video, point out how the two Script checks and one Claude Agent are chosen and connected.
2. In the second video, show the real run moving across the canvas. Open **Repository facts**, **Calculator checks**, and **Manager readiness brief** in turn; read each output rather than stopping at green status.
3. Open the run's **Info**, **Diff**, and **YAML** views. Explain that this check made no code changes, and a later feature run would put changes on its own branch for review.
4. Open [issue #1](https://github.com/Mohamedballouch/test-pdo/issues/1) and the [calculator demo](http://localhost:5173) if the app server is running. The issue describes the business goal; the calculator is the visible result.
5. Explain the boundaries: Claude Code performs Agent work, GitHub stores tickets and PRs, PDO makes the process observable, and PDSF is an optional method for preparing more complex work.

For common setup failures (daemon disconnected, missing Git author, agent sign-in, GitHub auth, wrong WSL path, failed nodes), use [Troubleshooting](05-troubleshooting.md).
