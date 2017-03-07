const { createChecker } = require('../Checker')
const { isThunkExpression, getThunkReturn,
  isObjectExpression, getConstructorObjectConfig } = require('../utils')

const CONSTRUCTOR_NAMES = [
  'GraphQLObjectType',
  'GraphQLInterfaceType',
  'GraphQLInputObjectType',
]

const meta = {
  docs: {
    description: 'All `fields` properties(in GraphQLObjectType, GraphQLInterfaceType, GraphQLInputObjectType) need `type` properties',
    category: 'Possible Errors',
    recommended: true
  },
  schema: []
}

function checkProps(ctx, objectExpressionNode) {
  if (!isObjectExpression(objectExpressionNode)) {
    return
  }

  const { properties } = objectExpressionNode

  properties.forEach((prop) => {
    const { value: valueNode } = prop

    if (!isObjectExpression(valueNode)
      || valueNode.properties.some(valueProp => valueProp.key.name === 'type')) {
      return
    }

    ctx.report(valueNode, 'expect "type" property')
  })
}

const create = createChecker.bind(null, {
  onGraphQLNewExpression(typeName, newExpressionNode) {
    if (!CONSTRUCTOR_NAMES.some(name => name === typeName)) {
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
