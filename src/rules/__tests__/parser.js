const { parse } = require('babel-eslint')

const DEFAULT_PARSE_OPTIONS = {
  ecmaVersion: 2015,
  sourceType: 'module'
}

// get the first elemetn of "body"
function getASTSnippet(code) {
  const parseResult = parse(code, DEFAULT_PARSE_OPTIONS)

  const { body } = parseResult

  if (!Array.isArray(body) || body.length !== 1) {
    throw new Error(`unexpected code snippet:\n${code}`)
  }

  return body[0]
}

module.exports = {
  getASTSnippet,
}
