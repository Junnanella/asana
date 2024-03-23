import * as vscode from "vscode";
import {
  askUserToSetupTokenIfTheyHavent,
  getPersonalAccessToken,
} from "./personal_access_token";
import { asanaTaskUrlRegex, getAsanaTaskDetails, getAsanaTaskId } from "./asana_task";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

  const hoverProvider: vscode.HoverProvider = {
    // TODO: Support multiple URLs in one line later
    async provideHover(document, position) {
      const existingApiToken = getPersonalAccessToken();

      // Cannot load Asana task if the user has never set an API token
      if (!existingApiToken) {
        return;
      }

      const line = document.lineAt(position.line);
      const match = line.text.match(asanaTaskUrlRegex);

      // Link doesn't even appear in the line
      if (!match) {
        return;
      }

      const asanaLinkIndex = line.text.indexOf(match[0]);
      const lengthOfAsanaLink = match[0].length;

      // Link does appear, but I'm not hovering over it
      if (
        position.character < asanaLinkIndex ||
        position.character > asanaLinkIndex + lengthOfAsanaLink
      ) {
        return;
      }

      const taskId = getAsanaTaskId(line.text);
      const task = await getAsanaTaskDetails(taskId, existingApiToken);

      const boldTaskNameLink = `[**${task.name}**](${task.permalink_url})`;

      return new vscode.Hover([boldTaskNameLink, task.assignee?.name ?? "Unassigned", task.notes]);
    },
  };

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      [{ scheme: "file" }, { scheme: "untitled" }],
      hoverProvider
    )
  );

  await askUserToSetupTokenIfTheyHavent();
}

// This method is called when your extension is deactivated
export function deactivate() {}
