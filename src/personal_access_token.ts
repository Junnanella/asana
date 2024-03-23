import * as vscode from "vscode";

export const getPersonalAccessToken = (): string | null => {
  const config = vscode.workspace.getConfiguration();
  const existingApiToken =
    config.get<string>("asana.personalAccessToken") ?? null;
  return existingApiToken;
};

export const setPersonalAccessToken = async (token: string): Promise<void> => {
  const config = vscode.workspace.getConfiguration();
  await config.update(
    "asana.personalAccessToken",
    token,
    vscode.ConfigurationTarget.Global
  );
};

export const askUserToSetupTokenIfTheyHavent = async(): Promise<void> => {
  const existingApiToken = getPersonalAccessToken();

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
        placeHolder: "Paste your 'Personal access token' here",
      });

      if (asanaApiToken) {
        setPersonalAccessToken(asanaApiToken);
      }
    }
  }
}