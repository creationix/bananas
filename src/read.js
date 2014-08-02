"use strict";
module.exports = function (code) {
  return parse(tokenize(code));
};

var rules = [
  null,       /^\s+/,
  null,       /^--.*/,
  CONSTANT,   /^(?:"(?:[^"\\]|\\.)*")/,
  CONSTANT,   /^(?:0|-?[1-9][0-9]*)/,
  CONSTANT,   /^(?:true|false|null)\b/,
  ID,       /^[^\s()[\]{}",'`:;#|\\]+/,
  CHAR,     /^./,
];

function ID(match) {
  return {id: match[0]};
}

function CONSTANT(match) {
  return {constant: JSON.parse(match[0])};
}

function CHAR(match) {
  return match[0];
}

function tokenize(code) {
  var offset = 0;
  var tokens = [];
  outer: while (offset < code.length) {
    var text = code.substring(offset);
    for (var i = 0; i < rules.length; i += 2) {
      var match = text.match(rules[i + 1]);
      if (!match) continue;
      var value = rules[i];
      if (typeof value === "function") {
        value = value(match);
      }
      if (typeof value === "string") {
        value = {char: value};
      }
      if (value) {
        value.offset = offset;
        tokens.push(value);
      }
      offset += match[0].length;
      continue outer;
    }
    break;
  }
  return tokens;
}

var openers = {
  "{": "}",
  "(": ")",
  "[": "]",
};
var closers = {
  "}": "{",
  ")": "(",
  "]": "[",
};


function parse(tokens) {
  var current = [];
  var stack = [];
  var expectStack = [];
  tokens.forEach(function (token) {
    if (token.char) {
      if (token.char in openers) {
        stack.push(current);
        expectStack.push(openers[token.char]);
        current = [];
        Object.defineProperty(current, "offset", {
          value: token.offset
        });
      }
      else if (token.char in closers) {
        var expected = expectStack.pop();
        if (expected !== token.char) {
          return current.push({
            error: expected ?
              "Expected " + expected + " but found " + token.char :
              "Unexpected " + token.char,
            offset: token.offset
          });
        }
        var value = current;
        if (token.char === "]") {
          value.unshift({id:"list"});
        }
        else if (token.char === "}") {
          value.unshift(value.splice(1, 1)[0]);
        }
        current = stack.pop();
        current.push(value);
      }
      else {
        return current.push({
          error:"Unexpected character: " + token.char,
          offset: token.offset,
        });
      }
    }
    else {
      current.push(token);
    }
  });
  var expected;
  while ((expected = expectStack.pop())) {
    current.push({
      error: "Missing closing " + expected,
      offset: tokens[tokens.length - 1].offset,
    });
  }
  return current;
}
