function is(type, argNode) {
  return argNode && argNode.type === type
}

const isIdentifier = is.bind(null, 'Identifier')
const isObjectPattern = is.bind(null, 'ObjectPattern')
const isCallExpression = is.bind(null, 'CallExpression')
const isObjectExpression = is.bind(null, 'ObjectExpression')
const isFunctionExpression = is.bind(null, 'FunctionExpression')
const isArrowFunctionExpression = is.bind(null, 'ArrowFunctionExpression')
const isReturnStatement = is.bind(null, 'ReturnStatement')
const isBlockStatement = is.bind(null, 'BlockStatement')
const isNewExpression = is.bind(null, 'NewExpression')

function isThunkExpression(argNode) {
  return isFunctionExpression(argNode) || isArrowFunctionExpression(argNode)
}

function isGraphQLModule(literalNode) {
  return literalNode && literalNode.value === 'graphql'
}

function getName(importSpecifierNode) {
  const { imported, local } = importSpecifierNode

  const originalName = imported.name
  const localName = local ? local.name : originalName

  return {
    originalName,
    localName,
  }
}

function getNames(specifiers) {
  if (!Array.isArray(specifiers)) {
    return null
  }

  const names = specifiers
    .filter(specifier => specifier.type === 'ImportSpecifier')
    .map(getName)

  const namesObj = {}

  names.forEach((name) => {
    const { originalName, localName } = name

    namesObj[localName] = originalName
  })

  return namesObj
}

function getLocalNamesByImport(importDecalrationNode) {
  const { source, specifiers } = importDecalrationNode

  if (!isGraphQLModule(source)) {
    return {}
  }

  return getNames(specifiers)
}

function getLocalNamesFromProperties(properties) {
  if (!Array.isArray(properties)) {
    return null
  }

  const names = {}

  properties.forEach((prop) => {
    const { key, value } = prop

    names[value.name] = key.name
  })

  return names
}

function getLocalNamesByRequire(variableDeclarationNode) {
  const { declarations } = variableDeclarationNode
  let names = {}

  if (!Array.isArray(declarations) || declarations.length < 1) {
    return null
  }

  declarations.forEach((declaration) => {
    const idNode = declaration.id
    const initNode = declaration.init

    // ignore
    if (!isObjectPattern(idNode) || !isCallExpression(initNode) || !isIdentifier(initNode.callee)
      || initNode.callee.name !== 'require' || initNode.arguments.length < 1
      || initNode.arguments[0].type !== 'Literal' || initNode.arguments[0].value !== 'graphql') {
      return
    }

    names = Object.assign(names, getLocalNamesFromProperties(idNode.properties))
  })

  return names
}

function getBlockStatementReturnStatement(blockStatementNode) {
  if (!blockStatementNode.body) {
    return null
  }

  const statements = blockStatementNode.body

  const returnStatements = statements.filter(isReturnStatement)

  if (returnStatements.length < 1) {
    return null
  }

  return returnStatements[0]
}

function getReturnStatementArgument(returnStatement) {
  return returnStatement && returnStatement.argument
}

function getFunctionExpressionReturn(node) {
  if (!(node && node.body)) {
    return null
  }

  const returnStatement = getBlockStatementReturnStatement(node.body)

  return getReturnStatementArgument(returnStatement)
}

function getArrowFunctionExpressionReturn(node) {
  if (!(node && node.body)) {
    return null
  }

  if (isBlockStatement(node.body)) {
    return getReturnStatementArgument(getBlockStatementReturnStatement(node.body))
  }

  return node.body
}

function getThunkReturn(exp) {
  if (isFunctionExpression(exp)) {
    return getFunctionExpressionReturn(exp)
  }

  if (isArrowFunctionExpression(exp)) {
    return getArrowFunctionExpressionReturn(exp)
  }

  return null
}

function getObjectFromConfig(node) {
  if (isObjectExpression(node) || isIdentifier(node)) {
    return node
  }

  if (isThunkExpression(node)) {
    return getObjectFromConfig(getThunkReturn(node))
  }

  // unknown
  return null
}

function getConstructorObjectConfig(newExpressionNode) {
  const { arguments: args } = newExpressionNode

  if (!Array.isArray(args) || args.length < 1) {
    return null
  }

  const firstArgNode = args[0]

  return getObjectFromConfig(firstArgNode)
}

function transformProperties(propsArray) {
  const propsByKeyName = {}

  if (!Array.isArray(propsArray)) {
    return propsByKeyName
  }

  propsArray.forEach((prop) => {
    const { key } = prop
    const { name } = key

    propsByKeyName[name] = prop
  })

  return propsByKeyName
}

function createReport(node, msg) {
  if (!node || !msg) {
    throw new Error('try to create an invalid report')
  }

  return {
    node, msg
  }
}

function createTask(node, typeName) {
  if (!typeName || !node) {
    throw new Error('try to create an invalid task')
  }

  return {
    typeName, node
  }
}

function getNameFromAlias(alias, name) {
  return Object.hasOwnProperty.call(alias, name) ? alias[name] : null
}

module.exports = {
  getLocalNamesByImport,
  getLocalNamesByRequire,
  is,
  isIdentifier,
  isObjectExpression,
  isThunkExpression,
  isFunctionExpression,
  isArrowFunctionExpression,
  isNewExpression,
  getFunctionExpressionReturn,
  getArrowFunctionExpressionReturn,
  getThunkReturn,
  getConstructorObjectConfig,
  transformProperties,
  createReport,
  createTask,
  getNameFromAlias,
}
