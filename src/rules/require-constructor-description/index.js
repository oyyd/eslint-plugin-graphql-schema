const { createChecker } = require('../Checker')
const { getConstructorObjectConfig } = require('../utils')

const meta = {
  docs: {
    description: 'Require `description` property for constructors',
    category: 'Best Practices',
    recommended: false
  },
  schema: []
}

const CONSTRUCTORS = [
  'GraphQLScalarType',
  'GraphQLObjectType',
  'GraphQLInterfaceType',
  'GraphQLUnionType',
  'GraphQLEnumType',
  'GraphQLInputObjectType',
]

const create = createChecker.bind(null, {
  onGraphQLNewExpression(typeName, newExpressionNode) {
    if (!CONSTRUCTORS.some(cons => cons === typeName)) {
      return
    }

    const objectConfigNode = getConstructorObjectConfig(newExpressionNode)

    if (objectConfigNode && !objectConfigNode.properties.some(prop => prop.key.name === 'description')) {
      this.ctx.report(objectConfigNode, 'expect "description" property')
    }
  }
})

module.exports = {
  meta,
  create,
}
