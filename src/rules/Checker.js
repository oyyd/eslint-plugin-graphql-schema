const { getLocalNamesByImport, getLocalNamesByRequire,
  isIdentifier, getNameFromAlias } = require('./utils')

class Checker {
  constructor(ctx, options = {}) {
    const { entryPoints, onGraphQLNewExpression } = options

    this.ctx = ctx
    this.alias = {}
    this.entries = {}

    this.VariableDeclaration = this.VariableDeclaration.bind(this)
    this.ImportDeclaration = this.ImportDeclaration.bind(this)
    this.GraphQLNewExpression = this.GraphQLNewExpression.bind(this)

    if (onGraphQLNewExpression) {
      this.onGraphQLNewExpression = onGraphQLNewExpression.bind(this)
    }

    if (typeof entryPoints === 'object') {
      // bind entry points
      Object.keys(entryPoints).forEach((entryName) => {
        this[entryName] = entryPoints[entryName].bind(this)
        this.entries[entryName] = this[entryName]
      })
    }

    Object.assign(this.entries, {
      VariableDeclaration: this.VariableDeclaration,
      ImportDeclaration: this.ImportDeclaration,
      // special
      NewExpression: this.GraphQLNewExpression,
    })
  }

  VariableDeclaration(variableDeclarationNode) {
    this.alias = Object.assign({}, this.alias,
      getLocalNamesByRequire(variableDeclarationNode))
  }

  ImportDeclaration(importDeclarationNode) {
    this.alias = Object.assign({}, this.alias,
      getLocalNamesByImport(importDeclarationNode))
  }

  GraphQLNewExpression(newExpressionNode) {
    if (this.NewExpression) {
      this.NewExpression(newExpressionNode)
    }

    const { alias } = this
    const { callee } = newExpressionNode
    const name = isIdentifier(callee) ? callee.name : null
    const typeName = getNameFromAlias(alias, name)

    if (!typeName || !this.onGraphQLNewExpression) {
      return
    }

    this.onGraphQLNewExpression(typeName, newExpressionNode)
  }
}

function createChecker(entryPoints, ctx) {
  const checker = new Checker(ctx, entryPoints)
  const { entries } = checker

  return entries
}

module.exports = {
  Checker,
  createChecker,
}
