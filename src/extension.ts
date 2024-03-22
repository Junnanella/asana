// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "asana" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("asana.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from Asana!");
  });

  // https://asana.com/123/456 <= If we see this, show a tooltip with the task name (make an API call)

  // To get a tooltip extension, you need to do this:
  // https://stackoverflow.com/questions/54792391/vs-code-hover-extension-implement-hoverprovider

  const hoverProvider: vscode.HoverProvider = {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);

      return new vscode.Hover(
        `Hello from Asana! You are hovering over ${word}`
      );
    },
  };

  vscode.languages.registerHoverProvider({ scheme: "file" }, hoverProvider);

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
