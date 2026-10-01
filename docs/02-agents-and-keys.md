# 2. Configure the agent, model, and credentials

PDO orchestrates an **agent program** (called a harness). It does not itself supply a language model or an API key. Install and authenticate at least one harness **in the same Ubuntu account that runs the PDO daemon**. The walkthrough uses Claude Code because it is already installed and signed in on this machine.

## The recommended Claude Code setup

1. In Ubuntu, confirm **claude --version** and **claude auth status**. If either fails, return to [installation](01-install-and-connect.md).
2. Open [PDO](http://localhost:5172). Select the **Settings** button in the top-right corner.
3. Select **Agents** on the left. In **Harness & models**, keep **Default harness** at Claude (or explicitly select **claude**).
4. Leave **Default model** at **default model** for the model chosen by your Claude account. Set a model only when you intentionally want to pin one and your installed Claude Code supports it.
5. Optionally open **Agent profiles** and create a named harness/model/effort preset. A profile can be selected for a project, a run, or a node. You can leave the default profile unchanged for the first run.
6. Close Settings. In **New Run**, the **Agent — New Run** control can inherit this setting or override it for one run.
7. In a pipeline, select an agent node and inspect the **Node Inspector**. A node can also choose its own harness/model. That node setting takes priority over the run and instance defaults.

The model choice is a launch preference; your harness account determines which models you can actually use. An empty model field means the harness's own account default. See [PDO's harness support table](https://github.com/Loulen/prompt-driven-orchestrator/blob/main/docs/reference/harnesses.md) for the capabilities and version last checked for each built-in harness.

## Which login or key is needed?

| Task | Recommended setup | Where the credential lives |
| --- | --- | --- |
| Run Claude Code in PDO | Sign in to Claude Code in Ubuntu with an eligible Claude account | Claude Code's own local configuration |
| Use Anthropic API billing instead | Configure a Console API key through Claude Code, following Anthropic's authentication guide | Claude Code / environment, never a pipeline prompt |
| Read GitHub issues | Sign in with **gh auth login** in Ubuntu | GitHub CLI local auth configuration |
| Push a branch or create a PR | Use **gh auth setup-git** after GitHub CLI sign-in | Git / GitHub CLI local auth configuration |
| Read Jira Cloud tickets from a Claude Agent | Connect Atlassian MCP to Claude Code and sign in with Jira | Claude Code's user-level MCP configuration and Atlassian OAuth |
| Run the calculator app | No AI or GitHub key | It uses local calculations in the browser |

**Claude login and GitHub login solve different problems.** Your Claude subscription does not grant GitHub issue access. A GitHub token does not pay for Claude model usage. Do not copy **gh auth token** or any API key into a PDO node prompt.

Jira is separate again: PDO has no built-in Jira account switch. The [Jira and ticket guide](09-jira-and-ticket-integration.md) shows the Claude Code connection, the required ticket-reading node, and the optional REST route for scheduled discovery. A Jira URL alone does not authenticate the agent.

Claude Code's current [setup](https://code.claude.com/docs/en/setup) and [authentication](https://code.claude.com/docs/en/authentication) guides explain the account and API options. GitHub CLI's [auth guide](https://cli.github.com/manual/gh_auth_login) explains its browser flow and token alternative.

## Other built-in harnesses

Install an alternative **inside Ubuntu**, sign in to it, run it by itself once, then select it under **Settings → Agents → Default harness** or choose it for a specific Run. You need only one harness for a pipeline; the example is written for Claude but its nodes inherit the Run harness.

### OpenCode

The [OpenCode installation guide](https://opencode.ai/docs/) lists:

~~~bash
curl -fsSL https://opencode.ai/install | bash
opencode --version
opencode
~~~

Inside OpenCode, use **/connect** to select and authenticate a provider, then select a model with **/models**. The [provider guide](https://opencode.ai/docs/providers/) gives the exact key or login steps for each provider. Costs and availability depend on that provider. Do not install OpenCode only to make PDO work if Claude Code is already authenticated.

### GitHub Copilot CLI

The [GitHub Copilot CLI guide](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli) supports this Linux installer:

~~~bash
curl -fsSL https://gh.io/copilot-install | bash
copilot --version
copilot
~~~

On first launch, use **/login** if prompted. Copilot CLI requires an eligible Copilot plan and any organization policy that allows CLI use. Its sign-in is separate from **gh auth login**. Alternatively, the official npm installer requires Node.js 22 or later:

~~~bash
npm install -g @github/copilot
~~~

### Pi and custom agents

PDO also ships built-in support for **pi**. Follow [Pi's own installation and provider instructions](https://pi.dev/), sign in, then choose **pi** in PDO. For another terminal agent, PDO supports a custom descriptor at ~/.pdo/harnesses/descriptors.yaml; see the [PDO harness reference](https://github.com/Loulen/prompt-driven-orchestrator/blob/main/docs/reference/harnesses.md). A tool being installed on Windows does not make it available to the Ubuntu daemon. For example, Codex CLI is not a built-in choice in this PDO version; it needs a descriptor before PDO can launch it as a node.

## Check before a run

~~~bash
claude --version
claude auth status
gh auth status
git -C ~/test-pdo config user.name
git -C ~/test-pdo config user.email
~~~

In PDO Settings → Agents, check that the selected harness matches the executable you authenticated. If a node gets stuck on a sign-in or trust dialog, open its terminal in the Run view and resolve the prompt there. If the harness itself cannot run from Ubuntu, PDO cannot fix its login.

For this repository's first issue, leave the agent at **claude**, model at **default model**, and sandbox at the instance default **off**. This machine's PDO UI reports that its Docker daemon is unavailable, so the Docker-backed sandbox profiles are disabled.

Next: [create the pipeline](04-pipelines.md) or [run issue #1](03-github-issue-to-run.md).
