var request = require('js-git/net/request-xhr');
var bodec = require('bodec');

module.exports = loadFile;

function* loadFile(path) {
  var res = yield request("GET", path, {});
  if (res.statusCode !== 200) {
    throw new Error("Invalid status code: " + res.statusCode);
  }
  return bodec.toUnicode(res.body);
}
