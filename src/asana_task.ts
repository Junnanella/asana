export const asanaTaskUrlRegex =
  /https?:\/\/app\.asana\.com\/0\/[0-9]+\/([0-9]+)(\/f)?/i;

export const getAsanaTaskId = (text: string): string => {
  // Format 1: https://app.asana.com/0/1150527741687836123213/1206911076351813
  // Format 2: https://app.asana.com/0/1150527741687836/1206911076351813/f

  const match = text.match(asanaTaskUrlRegex);

  if (!match) {
    // This should never happen because this is only called if
    // the hover provider detects a regex match
    throw new Error("Unexpected invalid Asana URL");
  }

  return match[1];
};

export interface Task {
  assignee: { gid: string; name: string; resource_type: string } | null;
  completed: boolean;
  due_at: string | null;
  due_on: string | null;
  followers: { gid: string; name: string; resource_type: string }[];
  gid: string;
  name: string;
  notes: string;
  num_likes: number;
  permalink_url: string;
}

export const getAsanaTaskDetails = async (
  taskId: string,
  apiToken: string
): Promise<Task> => {
  // TODO: Actually fetch the Task with the API + API key

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiToken}`,
    },
  };

  const response = await fetch(
    `https://app.asana.com/api/1.0/tasks/${taskId}`,
    options
  );
  const json = (await response.json()) as { data: Task };

  return json.data;
};
