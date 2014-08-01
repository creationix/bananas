module.exports = write;

var identRegex =  /^[^{}[\]();:,.'"`\s]+/;

function formatProperty(property) {
  return identRegex.test(property) ? property : JSON.stringify(property);
}

function write(value) {
  if (!Array.isArray(value)) {
    if (value.id) return value.id;
    if (value.char) return value.char;
    if (value.lookup) {
      return write(value.value) + "." + formatProperty(value.lookup);
    }
    if (value.error) {
      return "<|" + value.error + "|>";
    }
    if ("constant" in value) value = value.constant;
    return JSON.stringify(value);
  }
  var body = [];
  var props = [];
  for (var key in value) {
    if (!value.hasOwnProperty(key)) continue;
    if ((key|0) != key) {
      props.push(key + ": " + write(value[key]));
    }
    else {
      body.push(write(value[key]));
    }
  }
  var first, rest;
  if (body.length) {
    first = [body[0]];
    rest = body.slice(1);
  }
  else {
    first = [];
    rest = body;
  }
  var firstLength = first.reduce(function (sum, item) {
    return sum + item.length;
  }, first.length);
  var restLength = rest.reduce(function (sum, item) {
    return sum + item.length;
  }, rest.length);
  var propsLength = props.reduce(function (sum, item) {
    return sum + item.length;
  }, props.length);

  if (firstLength + restLength + propsLength < 80) {
    return "(" +
      first.concat(props).concat(rest).join(" ") +
      ")";
  }
  if (firstLength + propsLength < 80) {
    return "(" +
      first.concat(props).join(" ") +
      "\n  " +
      rest.join("\n").split("\n").join("\n  ") +
      ")";
  }
  return "(" +
    (first.length ? "" : " ") +
    first.concat(props).concat(rest).join("\n").split("\n").join("\n  ") +
    ")";
}
