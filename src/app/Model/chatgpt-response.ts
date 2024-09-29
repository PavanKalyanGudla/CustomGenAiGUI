export interface ChatgptResponse {
    choices: Array<{
        message: {
          role: string;
          content: string;
        }
      }>
}
