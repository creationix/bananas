module.exports = evaluate;

// Given an expression, evaluate it and return the result.
function evaluate(value) {
  // non-lists are returned as-is.
  if (!Array.isArray(value)) { return value; }
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

}
