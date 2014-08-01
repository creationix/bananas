"use strict";

var CodeMirror = require('codemirror/lib/codemirror');
require('codemirror/addon/runmode/runmode');

module.exports = CodeMirrorViewer;

function CodeMirrorViewer() {

  return { render: render };

  function render(props) {
    var theme = props.isDark ? "notebook-dark" : "notebook";
    var content = ["pre", {class: "CodeMirror cm-s-" + theme}];
    CodeMirror.runMode(props.code, props.mode, function (text, style) {
      if (style) {
        content.push(["span", {class: "cm-" + style.split(" ").join(" cm-")}, text]);
      }
      else {
        var index = content.length - 1;
        if (typeof content[index] === "string") {
          content[index] += text;
        }
        else content.push(text);
      }
    });
    return content;
  }
}
