import fs from 'fs';

export const log = (message: string) => {
  // console.log(message)
  fs.appendFileSync('crawler.log', message + "\n");
};
