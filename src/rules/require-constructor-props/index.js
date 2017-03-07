const { createChecker } = require('../Checker')
const { createReport, getConstructorObjectConfig, isObjectExpression } = require('../utils')

const meta = {
  docs: {
    description: 'Report missing properties required by type constructors',
    category: 'Possible Errors',
    recommended: true,
  },
  schema: []
}

const PROPS = {
  GraphQLSchema: ['query'],
  GraphQLScalarType: ['name', 'serialize'],
  GraphQLObjectType: ['name', 'fields'],
  GraphQLInterfaceType: ['name', 'fields'],
  GraphQLUnionType: ['name', 'types'],
  GraphQLEnumType: ['name', 'values'],
  GraphQLInputObjectType: ['name', 'fields'],
}

function check(newExpressionNode, requiredProps) {
  const reports = []

  const configObjectNode = getConstructorObjectConfig(newExpressionNode)

  // ignore
  if (isObjectExpression(configObjectNode)) {
    const { properties } = configObjectNode

    requiredProps.forEach((propName) => {
      if (!properties.some(prop => prop.key.name === propName)) {
        reports.push(createReport(configObjectNode, `expect "${propName}" property`))
      }
    })
  }

  return reports
}

const create = createChecker.bind(null, {
  onGraphQLNewExpression(typeName, newExpressionNode) {
    const requiredProps = PROPS[typeName]

    if (!requiredProps) {
      return
    }

    const reports = check(newExpressionNode, requiredProps)

    reports.forEach(report => this.ctx.report(report.node, report.msg))
  }
})

module.exports = {
  meta,
  create,
}
