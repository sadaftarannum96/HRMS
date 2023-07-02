import fs from 'fs';
import {fileURLToPath} from 'url';
import path from 'path';
import {until, string_to_slug, WalkPromise} from './utils.mjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excludeFolders = ['images', 'styles', 'stories', 'apis', '@types'];
async function main() {
  const [err, results] = await until(
    WalkPromise(path.join(__dirname, '../src'), excludeFolders),
  );
  const filteredFiles = results.filter((filepath) =>
    filepath.endsWith(".js") || filepath.endsWith(".ts"),
  ).filter((path)=> !path.endsWith("api.js") && !path.endsWith("test.js") && !path.endsWith(".d.ts"));
  console.log(filteredFiles.length);
  filteredFiles.forEach((f) => {
   
    renameToJSX(f);
  });
}
function renameToJSX(filepath) {
    // console.log('reading...',filepath,'\n');
    fs.readFile(filepath, 'utf-8', (err, data) => {
    if (err) throw err;
const matches =data.match(/<[^>|^\s]*>/g);
// console.log(matches, "matches")
    if (matches?.length) {
        console.log('has jsx: ', filepath, '\n matches: ', matches[0]);
      fs.rename(filepath, filepath + 'x', (err) => {
        if (err) throw err;
        console.log('file name changed', filepath);
      });
    }
  });
}
main();
