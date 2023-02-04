import fs from 'fs';

export const log = (message: string) => {
  // console.log(message)
  fs.appendFile('crawler.log', message + "\n", () => {});
};
