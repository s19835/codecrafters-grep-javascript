function matchPattern(inputLine, pattern) {
  if (pattern.length === 1) {
    return inputLine.includes(pattern);
  } 
  else if (pattern === '\\d') {
    return /\d/.test(inputLine);
  }
  else if (pattern === '\\w') {
    return /\w/.test(inputLine);
  }
  else if (pattern.startsWith('[') && pattern.endsWith(']')) {
    const charGroup = pattern.slice(1, -1);
    const charCheck = new RegExp(`[${charGroup}]`);
    return charCheck.test(inputLine);
  }
  else {
    throw new Error(`Unhandled pattern ${pattern}`);
  }
}

//function to parse the pattern into a list of tokens representing character classes or literals.
function parsePattern(pattern) {
  const tokens = [];
  let i = 0;

  while (i < pattern.length) {
    if (pattern[i] === '\\') {
      if (pattern[i+1]) {
        tokens.push('\\' + pattern[i+1]);
        i += 2;
      }
      else throw new Error(`Invalid escape sequence at end of pattern: ${pattern}`);
    } 
    else if (pattern[i] === '[') {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== ']') {
        j ++;
      }
      if (j >= pattern.length) {
        throw new Error(`Unclosed character class starting at index ${i}: ${pattern}`);
      }
      tokens.push(pattern.slice(i, j+1));
      i = j+1;
    }
    else {
      tokens.push(pattern[i]);
      i++;
    }
  }

  return tokens;
}

//function to check if a single character matches a pattern token.

//function to iterate through the input line and the parsed pattern to check for a match.


function main() {
  const pattern = process.argv[3];
  const inputLine = require("fs").readFileSync(0, "utf-8").trim();

  if (process.argv[2] !== "-E") {
    console.log("Expected first argument to be '-E'");
    process.exit(1);
  }


  if (matchPattern(inputLine, pattern)) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
