import fs from 'fs';
import {fileURLToPath} from 'url';
import path from 'path';
import {until, string_to_slug, WalkPromise, tMatchRegex} from './utils.mjs';
import minimist from 'minimist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // const args = minimist(process.argv.slice(2));
  replaceRoutes({
    filePath: 'src/App.js',
    srcIdentifier: 'ROUTES = [',
    destIdentifier: `const ROUTES = [`,
  });
}

function replaceRoutes({filePath, srcIdentifier, destIdentifier}) {
  const fileContent = fs.readFileSync(
    path.resolve(__dirname, '../', filePath),
    'utf-8',
  );
  // console.log(fileContent.slice(0,1000))
  // const match = fileContent.match(/HRMS_ROUTES = \[.|\n(.*)\n\];/)
  // const match = fileContent.match(/HRMS_ROUTES = \[.|(\n)\]/)
  // console.log(match);
  // console.log(match[0])
  // console.log(match[1])
  // console.log(match[2])
  const startingIdx = fileContent.indexOf(srcIdentifier) + srcIdentifier.length;
  const endingIdx = fileContent.slice(startingIdx).indexOf('\n  ];');
  const objs = fileContent.substring(startingIdx, startingIdx + endingIdx + 1);
  // console.log(objs);
  const finalObjs = objs.replace(/([\s\n]+component:\s.+,)/g, '');
  // console.log("---------------------\n",finalObjs+"]")

  const destFilePath = 'src/ERPCommandPalette.jsx';
  const destFileContent = fs.readFileSync(
    path.resolve(__dirname, '../', destFilePath),
    'utf-8',
  );
  const insertIdx =
    destFileContent.indexOf(destIdentifier) + destIdentifier.length;
  let remainingStr = destFileContent.substring(insertIdx);
  if (remainingStr[0] === ']') {
    // do nothing
  } else {
    remainingStr = remainingStr.substring(remainingStr.indexOf('];') - 1);
  }
  const updatedContent =
    destFileContent.substring(0, insertIdx) + finalObjs + remainingStr;
  fs.writeFileSync(
    path.resolve(__dirname, '../', destFilePath),
    updatedContent,
  );
}
main();
