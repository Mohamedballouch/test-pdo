# 8. PDO questions and answers

These answers describe the **PDO v1.110.0** setup used for this demo. The words on your screen can differ after an update. Start with the [installation guide](01-install-and-connect.md) if PDO or the agent is not running yet, and use the [two MP4 demonstrations](http://localhost:5172/pages/pdo-guide/videos.html) to see the clicks.

## Getting started

### What do I need before my first run?

In the **same Ubuntu user account**, install and start PDO, install and sign in to an agent such as Claude Code, configure your Git author name and email, and clone the target Git repository. Confirm the PDO page says **Daemon: connected**. GitHub CLI (`gh`) is needed when a pipeline reads GitHub issues or creates pull requests; a local-only pipeline does not need GitHub authentication. Follow the [exact installation steps](01-install-and-connect.md) and [agent setup](02-agents-and-keys.md).

### Does PDO provide the AI model or require an API key?

PDO launches an installed **agent harness**; the harness supplies access to its models. In this demo, Claude Code is signed in to a Claude account in Ubuntu, so there is no Anthropic key to paste into PDO. If you use API billing or another harness, configure that credential in the harness itself. GitHub and Jira authentication are separate. See [agents, models, and credentials](02-agents-and-keys.md).

### Why does Git say “Author identity unknown”?

PDO creates commits in a run worktree, so Git needs `user.name` and `user.email`. Check them in the target repository and set them globally or for that repository. Then retry the failed step as appropriate. The commands are in [troubleshooting](05-troubleshooting.md#5-troubleshooting-and-recovery).

### Does PDO work with the Windows copy of Claude Code or a `C:\` repository path?

This demo's daemon runs in **Ubuntu under WSL**. It launches tools available to that Ubuntu user and reads Linux paths such as `/home/mohamed_ballouch/test-pdo`. Install/sign in to the agent there, and point **New Run → Target repository** at the Ubuntu clone. See [install and connect](01-install-and-connect.md).

## Skills and PDSF

### Does PDO come with default skills?

Yes, PDO v1.110.0 seeds **`pdo-interactive`** and **`pdo-orchestrate`** in its Skill bank. An Agent node uses the corresponding skill when you enable its **Interactive** or **Orchestrator** option; ordinary Agent nodes do not automatically receive both. PDO manages those two skills. They are not a general software-development methodology or a full library of coding skills. You can import or write other skills in **Settings → Agents → Skills → Open skill bank**, then select them for the instance, project, run, or node. PDO delivers the effective set into the run's worktree. See [PDO's Skill bank reference](https://github.com/Loulen/prompt-driven-orchestrator/blob/v1.110.0/docs/features.md#skill-bank).

### Must I install PDSF to use PDO?

No. **PDSF (Prompt Driven Software Factory)** is a separate, optional set of project skills and practices for turning a business request into specifications, tickets, implementation, tests, and review. The calculator pipeline and both MP4 runs work without it. Install PDSF into a repository when your team wants that shared method, or import selected skills into PDO when only particular Agent nodes need them. Installing PDSF changes the project files; follow [where PDSF fits](07-pdo-functional-and-configuration-guide.md#where-pdsf-comes-in) and review the resulting diff. The demo repository has **not** had PDSF installed.

### If I install PDSF, will every PDO Agent node automatically use it?

No. For a repository installation, the skills must be present in the source snapshot used for the run, and the relevant Agent prompt should call for the desired PDSF step. For the PDO Skill bank route, import and select the relevant skills at the instance, project, run, or node level. The full `/build-factory` scaffold is different from importing a few skills. See [the functional guide](07-pdo-functional-and-configuration-guide.md#where-pdsf-comes-in).

If the same skill name is already installed in the repository and selected from the bank, PDO keeps the repository copy and skips the bank duplicate. Review the run's skill warnings if you expected a different version.

## Tickets and repositories

### Where do I “link GitHub” in PDO?

There is no general **Connect GitHub account** field in this PDO version. Clone the repository in Ubuntu; its Git `origin` remote identifies GitHub. Sign in with `gh auth login` in Ubuntu if a node must read issues or create a PR, and set up Git's HTTPS authentication before pushing. In **New Run**, select the **local clone** and a source branch. See the [GitHub issue walkthrough](03-github-issue-to-run.md).

### Do I always have to paste a ticket URL?

No. A ticket URL is one convenient input for a **manual run** when the pipeline's first node knows how to fetch that URL. You can instead give a repository plus issue number, paste the ticket text, provide a specification file, or feed a ticket reference through an automated trigger—**if the pipeline can parse and use that input**. A bare URL does not make PDO fetch or watch tickets by itself. The supplied `issue-to-demo` walkthrough uses a **full GitHub issue URL** for clarity, but its Read issue prompt can also resolve an issue number against the selected repository's Git remote. See [pipeline concepts](04-pipelines.md#pipeline-vs-trigger-vs-run).

### Can PDO use Jira rather than GitHub Issues?

Yes, as a **pipeline integration**, not as an account switch in PDO settings. Give a node a way to read Jira—such as an authenticated Jira API/CLI/MCP tool—and instruct it how to turn a Jira key or URL into a ticket brief. Keep Jira credentials in that tool's secure configuration, not in a prompt or pipeline YAML. The target Git repository and its authentication are still configured separately. The [Jira guide](09-jira-and-ticket-integration.md) gives the options and setup; this repository's provided ticket pipeline currently reads **GitHub Issues**, so it needs adaptation before it can read Jira.

### Can PDO watch for new tickets automatically?

The first demo launches runs manually. For automation, create a **Trigger** with a UTC cron schedule and a guard script that checks a ticket source. When the guard exits `0`, its stdout becomes the new run's input; another exit code skips that tick. PDO has no built-in ticket deduplication: your guard and ticket workflow must mark or filter tickets already handled. The daemon must be running for scheduled triggers. See [PDO's Trigger reference](https://github.com/Loulen/prompt-driven-orchestrator/blob/v1.110.0/docs/features.md#triggers).

## Pipelines and runs

### Do I create a pipeline before a run?

Choose or create a saved pipeline first, then select it in **Runs → New Run**. A **pipeline** is the reusable sequence of nodes; a **run** is one execution against a repository, branch, and prompt. The two MP4s show both actions, and the [hands-on guide](06-hands-on-pipeline-demo.md) has the exact node choices and connections.

### Which nodes should I choose?

Use **Script** for repeatable commands such as tests and builds; use **Agent** where reading, writing, or judgment calls for an AI agent. **Start** receives the run input and **End** receives the final artifact. Use **Merge** when separate branches actually change isolated worktrees and their Git changes must be joined. The manager-readiness demo has two Script checks feeding one Claude Agent and needs no Merge node. See [pipeline concepts](04-pipelines.md) and [the recorded example](06-hands-on-pipeline-demo.md).

### How do I know what each node actually did?

Open the run and click each canvas card. Read **Inputs**, **Outputs**, **Terminal**, and **Initial Prompt**; an output artifact is stronger evidence than a green status alone. Also inspect the run's **Info**, **Diff**, and **YAML** tabs. Review Diff **before archiving**, because the observed archived run no longer displayed its Diff. The [run-inspection MP4](assets/run-inspection-demo.mp4) shows this node by node.

### Does a completed run create a GitHub pull request or close the ticket?

No. A completed run gives you a local branch/worktree and recorded outputs. Review its actual code changes and tests first; push and open a PR only when you choose to. Publication can be added as an explicit pipeline step for a more automated workflow. See [publish after review](03-github-issue-to-run.md#6-publish-only-after-review).

### What should I do if a node is stuck or fails?

Open that node's **Terminal** and **Outputs**, then check the previous node's handoff. Common causes are agent sign-in or directory trust, missing required output, failed tests, and a request waiting for your answer. Record the run ID and exact error before retrying. Use the [troubleshooting table](05-troubleshooting.md) for targeted fixes.

Next: [PDO functions and configuration](07-pdo-functional-and-configuration-guide.md), [Jira and other ticket sources](09-jira-and-ticket-integration.md), or the [MP4 demonstrations](http://localhost:5172/pages/pdo-guide/videos.html).
