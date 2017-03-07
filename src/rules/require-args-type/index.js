const { createChecker } = require('../Checker')
const { isThunkExpression, getThunkReturn,
  isObjectExpression, getConstructorObjectConfig } = require('../utils')

const meta = {
  docs: {
    description: 'All `args` properties need `type` properties',
    category: 'Possible Errors',
    recommended: true
  },
  schema: []
}

function checkArgs(ctx, objectExpressionNode) {
  const { properties } = objectExpressionNode

  if (!properties.some(prop => prop.key.name === 'type')) {
    ctx.report(objectExpressionNode, 'expect "type" property')
  }
}

function checkProps(ctx, objectExpressionNode) {
  if (!isObjectExpression(objectExpressionNode)) {
    return
  }

  const { properties } = objectExpressionNode

  properties.forEach((prop) => {
    const { value: valueNode } = prop

    if (!isObjectExpression(valueNode)) {
      return
    }

    const argsProperties = valueNode.properties.filter(valueProp =>
        valueProp.key.name === 'args' && isObjectExpression(valueProp.value))

    argsProperties.forEach(argProp => checkArgs(ctx, argProp.value))
  })
}

const create = createChecker.bind(null, {
  onGraphQLNewExpression(typeName, newExpressionNode) {
    if (typeName !== 'GraphQLObjectType') {
      return
    }

    const objectConfigNode = getConstructorObjectConfig(newExpressionNode)

    if (!isObjectExpression(objectConfigNode)) {
      return
    }

    const { properties } = objectConfigNode
    const arr = properties.filter(prop => prop.key.name === 'fields')

    if (arr.length < 1) {
      return
    }

    let objectExpressionNode = arr[0].value

    if (isThunkExpression(objectExpressionNode)) {
      objectExpressionNode = getThunkReturn(objectExpressionNode)
    }

    checkProps(this.ctx, objectExpressionNode)
  }
})

module.exports = {
  meta,
  create,
}
