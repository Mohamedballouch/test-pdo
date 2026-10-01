# 9. Jira and other ticket sources

This guide explains how to use a Jira ticket as the input to a **PDO v1.110.0** pipeline. The demonstrated repository currently uses **GitHub Issues**; no Jira account is connected to this PDO instance. The steps below assume **Jira Cloud** (`*.atlassian.net`) and Claude Code running in the same Ubuntu user account as the PDO daemon. Jira Data Center has different server and authentication options; use your organization's approved integration for that edition.

## What connects to what?

| Part | Responsibility | Where to configure it |
| --- | --- | --- |
| **PDO** | Runs the pipeline against a local Git repository and passes New Run input to its first node | PDO **Pipelines**, **Runs**, and optional **Triggers** |
| **Claude Code + Atlassian MCP** | Lets an Agent node search and read Jira, subject to the signed-in account's permissions | Claude Code in **Ubuntu**, not a PDO account page |
| **Jira Cloud REST API** | Lets a shell script read or search Jira for scheduled ticket discovery | A separate CLI/script and secret store in Ubuntu |
| **Git / GitHub** | Supplies the code repository and optional pull requests | Local Git clone, `git`/`gh` authentication |
| **PDSF** (optional) | Adds a method for turning business needs into tickets and implementation work | The project's PDSF skills or PDO Skill bank |

PDO does not have a built-in Jira account connector or automatically fetch a ticket when a URL appears in the prompt. The pipeline must explicitly tell an Agent node which tool to use. A Jira connection does not replace the local Git clone that PDO needs for code work. Likewise, PDSF can describe a Jira backlog, but it does not sign in to Jira for you.

## First path: read one Jira ticket with Claude Code

1. Confirm that you can open the intended ticket in Jira Cloud and note its site and key, for example `https://your-site.atlassian.net/browse/PROJ-123` and `PROJ-123`. Your Jira account needs permission to see the project and ticket.
2. In the **same Ubuntu account** that runs `pdo daemon`, install and sign in to Claude Code as described in [Agents, models, and credentials](02-agents-and-keys.md).
3. In Ubuntu, add Atlassian's MCP server to Claude Code at **user scope**. If `/mcp` already shows an authenticated Atlassian server for this Ubuntu account, reuse it instead of adding a duplicate:

   ~~~bash
   claude mcp add --transport http --scope user atlassian https://mcp.atlassian.com/v2/mcp
   claude mcp list
   claude
   ~~~

   User scope makes the server available when PDO starts Claude Code from a new run worktree. Claude Code's default *local* scope is tied to the directory where you add it. The endpoint and authentication flow come from [Atlassian's Claude Code setup](https://support.atlassian.com/atlassian-ai-gateway/docs/get-started-with-the-atlassian-remote-mcp-server/) and [Claude Code's MCP scope guide](https://code.claude.com/docs/en/mcp#user-scope).
4. Inside the interactive Claude Code session, enter `/mcp`, choose **atlassian**, and complete the browser sign-in. Then ask Claude Code to **read and summarize `PROJ-123` without changing it**. This checks access before introducing a PDO pipeline. If your organization blocks the connection, ask its Jira administrator which approved OAuth/MCP route to use.

   Atlassian says some MCP calls consume **Rovo credits**; check your organization's allowance before using ticket searches heavily or scheduling frequent runs. See [Atlassian's usage note](https://support.atlassian.com/atlassian-ai-gateway/docs/get-started-with-the-atlassian-remote-mcp-server/).
5. Create a saved PDO pipeline using [the pipeline guide](04-pipelines.md). The useful shape is **Start → Read Jira ticket → Build feature → Verify feature → Demo brief → End**. Give the first node an **Agent** type with the **claude** harness and a required Markdown output such as `issue-brief.md`. The other nodes can follow the [issue-to-demo example](examples/issue-to-demo.yaml). Replace its GitHub-specific first-node prompt with these instructions:

   > Read exactly the Jira Cloud work item identified by the New Run input using the authenticated Atlassian MCP tools. Accept a key such as `PROJ-123` or a full Jira `/browse/PROJ-123` URL. Record the key, URL, summary, description, acceptance criteria, relevant comments or links, and any unanswered questions in the required issue-brief output. Pass the brief to the implementation and verification nodes. Do not invent ticket details or change Jira. If the tool is unavailable or the ticket cannot be read, report that failure instead of implementing from a guess. Use the output path and completion instructions supplied by PDO.

6. In PDO **Runs → New Run**, choose the Ubuntu clone, source branch, this Jira-capable pipeline, and a request such as **`Implement PROJ-123; produce a reviewed manager demo brief.`** Launch one small, permitted ticket. In the run, inspect **Read Jira ticket → Inputs, Outputs, and Terminal** to verify that the ticket was genuinely retrieved. Then check the downstream results, **Diff**, and tests before publishing anything.

If you enable a Docker sandbox later, confirm that the sandboxed Claude Code session can still reach Atlassian and use its authentication. PDO's sandbox settings affect which harness configuration is staged; the successful interactive Ubuntu check alone does not prove sandbox access. Keep the first verification read-only.

## Do I need to paste a link every time?

No. **New Run → Prompt** is input text, not a mandatory ticket-link field. The first node's instructions determine what it can resolve:

| Input to New Run | What the first node needs to do | Good when |
| --- | --- | --- |
| Full Jira URL | Extract key/site, then fetch that exact ticket | People work across several Jira sites |
| `PROJ-123` | Use the configured Jira site/connection and fetch that key | One site is already configured |
| “Find the oldest Ready for AI item in PROJ” | Search Jira, choose **one** item by an explicit rule, and record its key | A person wants PDO to pick from a queue |
| Pasted ticket text or local spec | Use that text/file as the requirements; no Jira fetch | Jira access is unavailable |
| Trigger guard output such as `PROJ-123` | Read the key emitted by a scheduled guard | The team wants scheduled discovery |

The walkthrough for this repository's existing `issue-to-demo` pipeline uses a **full GitHub issue URL**, but its Read issue prompt can also use an issue number with the repository's Git remote. To use a Jira key, save a Jira-specific copy or edit the first node; merely changing the New Run input will not switch its `gh` command to Jira. See the [GitHub walkthrough](03-github-issue-to-run.md) and [FAQ](08-faq.md).

## Optional: discover tickets on a schedule

Start with the manual MCP path above. For scheduled discovery, create a PDO **Trigger** for the Jira-capable pipeline with a **UTC five-field cron** and a guard command. PDO runs the guard as a shell command in the target repository. Exit code `0` starts **one** run; nonzero skips the tick; nonempty standard output becomes that run's input. A guard is **not** a Claude Agent node and does not automatically gain its MCP tools; a plain guard script needs separate Jira CLI or REST access. [PDO's Trigger reference](https://github.com/Loulen/prompt-driven-orchestrator/blob/v1.110.0/docs/features.md#triggers) describes the controls.

For a small **Jira Cloud personal-script** example, Atlassian permits account email plus API token for REST calls. Create the token in your Atlassian account, and keep it in a private credential file outside this repository. For a team or production integration, use the identity and authentication approach your Jira administrator approves. [Atlassian's REST authentication guide](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/) describes the personal-script path. **Scoped service-account tokens use a different `api.atlassian.com/ex/jira/{cloudId}` endpoint**, so do not copy the site-URL example below for those credentials; follow [Atlassian's service-account token guide](https://support.atlassian.com/user-management/docs/manage-api-tokens-for-service-accounts/).

In Ubuntu, create a private `netrc` file with an editor, replacing the three placeholders. Do not put the real token in a shell command, Git file, PDO prompt, or screenshot:

~~~bash
mkdir -p ~/.config/pdo-jira
chmod 700 ~/.config/pdo-jira
touch ~/.config/pdo-jira/jira.netrc
chmod 600 ~/.config/pdo-jira/jira.netrc
nano ~/.config/pdo-jira/jira.netrc
~~~

In the editor, enter this **one line**, using your real Jira host, Atlassian email, and token:

~~~text
machine your-site.atlassian.net login you@example.com password YOUR_API_TOKEN
~~~

Test one read-only call using your real site and ticket key:

~~~bash
curl --fail --silent --show-error \
  --netrc-file "$HOME/.config/pdo-jira/jira.netrc" \
  --header 'Accept: application/json' \
  'https://your-site.atlassian.net/rest/api/3/issue/PROJ-123?fields=summary,status,description'
~~~

The response is JSON; Jira Cloud v3 descriptions may be structured **Atlassian Document Format** rather than plain text. For a queue, use Jira's current [JQL search endpoint](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/) (`/rest/api/3/search/jql`) in a guard script. A practical example rule is `project = PROJ AND status = "Ready for AI" ORDER BY created ASC`; replace that status with the name your team actually uses. Have the script emit the selected **key**, exit nonzero when no issue is ready, and mark or filter that key so the next scheduled check does not launch it again. Test the guard with PDO's **Test guard** control before enabling the schedule. Returning several keys in one guard output still creates **one** run, not one run per key; use a collection loop or another dispatcher if one run per ticket is required.

## Where PDSF fits with Jira

PDSF's `/build-factory` can record **Jira** as a business backlog or technical tracker in project guidance such as `docs/agents/business-backlog.md` or `docs/agents/issue-tracker.md`. Its `/verify-factory` can check a configured Jira CLI or MCP connection. It does **not** install Atlassian MCP, grant Jira permissions, or make PDO watch a queue. Configure Jira access first, then use PDSF only if you want its business-to-specification-to-ticket method. The [functional guide](07-pdo-functional-and-configuration-guide.md#where-pdsf-comes-in) explains PDSF and its installation choices.

## If it fails

| What you see | Check next |
| --- | --- |
| Claude Code reads Jira interactively, but a PDO node cannot | Same Ubuntu user? MCP server added at **user** scope? Did the node use **claude**? Is sandboxing changing its environment? Read the node's Terminal. |
| Jira says unauthorized or the item is missing | Complete `/mcp` sign-in, check site and key, and confirm the signed-in user can open that item in Jira. |
| REST call returns 401/403 | Check the netrc host, account email/token, ticket permissions, and organization policy. |
| Trigger launches the same issue repeatedly | Add a processed label/status or an external deduplication record; PDO does not track handled Jira keys. |
| Ticket is found but the implementation misses requirements | Open the first node's issue brief and ensure acceptance criteria, relevant comments, and unanswered questions reached the Build and Verify nodes. |

Next: [run and inspect the pipeline](06-hands-on-pipeline-demo.md), [review the PDO FAQ](08-faq.md), or [check agents and keys](02-agents-and-keys.md).
