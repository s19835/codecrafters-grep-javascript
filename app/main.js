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
    else if (pattern[i] === '+' || pattern[i] === '?'){
      if (tokens.length === 0) {
        throw new Error(`Invalid '+' quantifier at start of pattern: ${pattern}`);
      } else {
        tokens[tokens.length-1] += pattern[i];
        i++;
      }
    }
    else {
      tokens.push(pattern[i]);
      i++;
    }
  }

  return tokens;
}

//function to check if a single character matches a pattern token.
function matchChar(char, token) {
  if (token === '.') {
    return true;        // match any single char
  }
  else if (token.length === 1) {
    return char.includes(token);
  } 
  else if (token === '\\d') {
    return /\d/.test(char);
  }
  else if (token === '\\w') {
    return /\w/.test(char);
  }
  else if (token.startsWith('[') && token.endsWith(']')) {
    const charGroup = token.slice(1, -1);
    return new RegExp(`[${charGroup}]`).test(char);
  }
  else if (token.endsWith('+')) {
    const baseToken = token.slice(0, -1);
    return matchChar(char, baseToken);
  }
  else if (token.endsWith('?')) {
    const baseToken = token.slice(0, -1);
    return char === '' || matchChar(char, baseToken);
  }
  else {
    return char === token;
  }
}

//function to iterate through the input line and the parsed pattern to check for a match.
function matchPattern(inputLine, pattern) {
  const tokens = parsePattern(pattern);
  let inputIndex = 0;
  let tokenIndex = 0;

  // If the pattern starts with ^
  const startsWithAnchor = tokens[0] === '^';
  // If the pattern ends with $
  const endsWithAnchor = tokens[tokens.length - 1] === '$';

  if (startsWithAnchor) {
    tokens.shift();
    if (!matchChar(inputLine[inputIndex], tokens[tokenIndex])) {
      return false;
    }
    inputIndex++;
    tokenIndex++;
  }

  if (endsWithAnchor) {
    tokens.pop();
  }

  while (inputIndex < inputLine.length && tokenIndex < tokens.length) {
    if (tokens[tokenIndex].endsWith('+')) {
      const baseToken = tokens[tokenIndex].slice(0, -1);
      let matchCount = 0;
      while (inputIndex < inputLine.length && matchChar(inputLine[inputIndex], baseToken)) {
        matchCount++;
        inputIndex++;
      }
      if (matchCount === 0) {
        return false; // If no matches found for a '+' quantifier, return false
      }
      tokenIndex++;
    }
    else if (tokens[tokenIndex].endsWith('?')) {
      const baseToken = tokens[tokenIndex].slice(0, -1);
      if (matchChar(inputLine[inputIndex], baseToken)) {
        inputIndex++;
      }
      tokenIndex++;
    }
    else if (matchChar(inputLine[inputIndex], tokens[tokenIndex])) {
      inputIndex++;
      tokenIndex++;
    } else {
      if (tokens.includes('^')) {
        return false; // If the '^' anchor is present and characters don't match, return false
      }
      inputIndex++;
      tokenIndex = 0;
    }
  }

  if (endsWithAnchor) return (inputIndex === inputLine.length && tokenIndex === tokens.length);
  else return tokenIndex === tokens.length;
}

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
