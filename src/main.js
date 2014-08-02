"use strict";
document.body.textContent = "";
// Load our UI related libraries
var domChanger = require('domchanger');
var CodeMirrorEditor = require('./ui/code-mirror-editor');
var CodeMirrorViewer = require('./ui/code-mirror-viewer');
require("codemirror/mode/javascript/javascript");
require('cm-jackl-mode');
var read = require('./read');
var write = require('./write');

// Load control-flow and IO libraries
var run = require('gen-run');
var loadFile = require('./load-file');

domChanger(App, document.body).update();

function App(emit, refresh) {

  var code = localStorage.getItem("code") || "";
  var readOnly = false;
  var mode = "jackl";
  var isDark = !!localStorage.getItem("isDark");
  var isRaw = !!localStorage.getItem("isRaw");
  var isVertical = !!localStorage.getItem("isVertical");

  if (!code) run(loadCode("samples/test.jkl"));

  var buttons = {};
  ["test", "maze-generator", "dragon"].map(function (name) {
    buttons[name] = function () {
      run(loadCode("samples/" + name + ".jkl"));
    };
  });

  return {
    render: render,
    on: {change: onChangeCode},
  };

  function* loadCode(path) {
    code = "Loading " + path + "...\n";
    readOnly = true;
    mode = "text";
    refresh();
    // yield* sleep(500);
    code = yield* loadFile(path);
    readOnly = false;
    mode = "jackl";
    refresh();
  }

  function render() {
    localStorage.setItem("code", code);
    localStorage.setItem("isDark", isDark ? "true" : "");
    localStorage.setItem("isRaw", isRaw ? "true" : "");
    localStorage.setItem("isVertical", isVertical ? "true" : "");
    var output = "";
    var outputMode = "text";
    if (mode === "jackl") {
      try {
        output = read(code);
        if (isRaw) {
          output = output.map(stringify).join("\n");
          outputMode = "javascript";
        }
        else {
          output = output.map(write).join("\n");
          outputMode = "jackl";
        }
      }
      catch (err) {
        output = err.stack;
        outputMode = "text";
      }
    }

    return [
      [".toolbar",
        Object.keys(buttons).map(function (name) {
          return ["button", {onclick: buttons[name]}, name];
        }),
        ["label",
          ["input", {type:"checkbox", checked: isDark, onchange: onChangeDark}],
          "Dark Theme"
        ],
        ["label",
          ["input", {type:"checkbox", checked: isRaw, onchange: onChangeRaw}],
          "Raw Output"
        ],
        ["label",
          ["input", {type:"checkbox", checked: isVertical, onchange: onChangeVertical}],
          "Vertical Layout"
        ],
      ],
      [isVertical ? ".top" : ".left",
        [CodeMirrorEditor, {
          isDark: isDark,
          id: true,
          code: code,
          readOnly: readOnly,
          mode: mode
        }]
      ],
      [isVertical ? ".bottom" : ".right",
        [CodeMirrorViewer, {
          isDark: isDark,
          lineWrapping: true,
          code: output,
          mode: outputMode
        }]
      ]
    ];
  }
  function onChangeDark() {
    /*jshint validthis: true*/
    isDark = this.checked;
    refresh();
  }

  function onChangeRaw() {
    /*jshint validthis: true*/
    isRaw = this.checked;
    refresh();
  }

  function onChangeVertical() {
    /*jshint validthis:true*/
    isVertical = this.checked;
    refresh();
  }

  function onChangeCode(newCode) {
    code = newCode;
    refresh();
  }

}

function* sleep(ms) {
  yield function (callback) {
    setTimeout(callback, ms);
  };
}

function stringify(value) {
  return JSON.stringify(value);
}