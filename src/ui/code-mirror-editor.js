"use strict";

var CodeMirror = require('codemirror/lib/codemirror');
require("codemirror/addon/edit/closebrackets");
require("codemirror/addon/comment/comment");
require("codemirror/keymap/sublime");
require("codemirror/addon/hint/anyword-hint");
require("codemirror/addon/hint/show-hint");

module.exports = CodeMirrorEditor;

function CodeMirrorEditor(emit) {
  var id;
  var code, mode, theme, readOnly, lineWrapping;
  var el;
  var cm = new CodeMirror(function (root) {
    el = root;
  }, {
    keyMap: "sublime",
    // lineNumbers: true,
    rulers: [{ column: 80 }],
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    styleActiveLine: true,
  });
  setTimeout(refresh);

  cm.on("change", function (_, change) {
    if (!id) return;
    code = cm.getValue();
    emit("change", code);
  });

  var replacements = {
    "lambda": "λ",
    "*": "×",
    "/": "÷",
    "<=": "≤",
    ">=": "≥",
    "!=": "≠",
  };

  cm.on("change", function (cm, change) {
    if (mode !== "jackl" || change.text[0] !== " ") return;
    var type = cm.getTokenTypeAt(change.from);
    if (type !== "operator" && type !== "builtin") return;
    var token = cm.getTokenAt(change.from, true);
    var replacement = replacements[token.string];
    if (!replacement) return;
    var line = change.to.line;
    cm.replaceRange(replacement, {
      ch: token.start,
      line: line
    }, {
      ch: token.end,
      line: line
    });
  });

  return { render: render };

  function refresh() {
    cm.refresh();
  }

  function render(props) {
    id = props.id;
    var newTheme = props.isDark ? "notebook-dark" : "notebook";
    if (newTheme !== theme) {
      theme = newTheme;
      cm.setOption("theme", theme);
    }
    if (props.mode !== mode) {
      mode = props.mode;
      cm.setOption("mode", mode);
    }
    if (props.code !== code) {
      code = props.code;
      cm.setValue(code);
    }
    if (props.readOnly !== readOnly) {
      readOnly = props.readOnly;
      cm.clearHistory();
      cm.setOption("readOnly", readOnly);
    }
    if (props.lineWrapping !== lineWrapping) {
      lineWrapping = props.lineWrapping;
      cm.clearHistory();
      cm.setOption("lineWrapping", lineWrapping);
    }
    if (props.focused && !cm.hasFocus()) {
      cm.focus();
    }
    setTimeout(refresh);
    return el;
  }
}
