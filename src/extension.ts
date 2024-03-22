// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration();
  const existingApiToken = await config.get("asana.personalAccessToken");

  if (!existingApiToken) {
    const setupApiKeyAction = "Complete Asana extension setup";
    const response = await vscode.window.showWarningMessage(
      "The Asana link extension requires setting up an [Personal Access Token](https://app.asana.com/0/my-apps). Click the button below to set it up.",
      setupApiKeyAction
    );
    const userWantsToSetupKey = response === setupApiKeyAction;

    if (userWantsToSetupKey) {
      const asanaApiToken = await vscode.window.showInputBox({
        title:
          "Go to https://app.asana.com/0/my-apps to create a 'Personal access token'",
        placeHolder:
          "Paste your 'Personal access token' here. It looks like '...'",
      });

      if (asanaApiToken) {
        await config.update(
          "asana.personalAccessToken",
          asanaApiToken,
          vscode.ConfigurationTarget.Global
        );
      }
    }
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("asana.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from Asana!");
  });

  const regex = /https?:\/\/app\.asana\.com\/0\/[0-9]+\/([0-9]+)(\/f)?/i;

  const getAsanaTaskId = (text: string): string => {
    // Format 1: https://app.asana.com/0/1150527741687836123213/1206911076351813
    // Format 2: https://app.asana.com/0/1150527741687836/1206911076351813/f

    const match = text.match(regex);

    if (!match) {
      // This should never happen because this is only called if
      // the hover provider detects a regex match
      throw new Error("Unexpected invalid Asana URL");
    }

    return match[1];
  };

  interface Task {
    name: string;
    description: string;
    url: string;
  }

  const getAsanaTaskDetails = async (taskId: string): Promise<Task> => {
    return {
      name: "Task Name",
      description: "Task Description",
      url: `https://app.asana.com/0/${taskId}/${taskId}/f`,
    };
  };

  const hoverProvider: vscode.HoverProvider = {
    // TODO: Support multiple URLs in one line later
    async provideHover(document, position, token) {
      const line = document.lineAt(position.line);
      const match = line.text.match(regex);

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
      const task = await getAsanaTaskDetails(taskId);

      const boldTaskNameLink = `[**${task.name}**](${task.url})`;

      return new vscode.Hover([boldTaskNameLink, task.description]);
    },
  };

  const disposableHoverProvider = vscode.languages.registerHoverProvider(
    [{ scheme: "file" }, { scheme: "untitled" }],
    hoverProvider
  );

  context.subscriptions.push(disposable, disposableHoverProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
