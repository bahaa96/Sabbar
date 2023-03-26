import fs from 'fs';
import parse from 'style-to-object';
import humps from 'humps';

const CSS_VARS_FILE_PATH = './src/vars.css';
const OUTPUT_FILE_PATH = './src/themeVars.ts';

try {
  const cssVarsFileContent = fs.readFileSync(CSS_VARS_FILE_PATH);
  const cssVarsString = cssVarsFileContent.toString();
  if (cssVarsString) {
    // extracts :root variables without the selector;
    const matchedGroups = [...cssVarsString.matchAll(/:root\s+{([\s\S]*?)}/gm)][0];
    if (matchedGroups.length) {
      const parsedVariables = parse(matchedGroups[1]);
      const outputFileContent = `export default ${JSON.stringify(
        humps.camelizeKeys(parsedVariables),
        null,
        2,
      )};`; 
      fs.writeFileSync(OUTPUT_FILE_PATH, outputFileContent);
    }
  }
} catch (e) {
  console.log(e);
}
