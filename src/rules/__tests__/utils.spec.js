const expect = require('expect')
const { getASTSnippet } = require('./parser')
const {
  getLocalNamesByImport,
  getLocalNamesByRequire,
  is,
  getFunctionExpressionReturn,
  getArrowFunctionExpressionReturn,
  getThunkReturn,
  getConstructorObjectConfig,
  transformProperties,
  createReport,
  createTask,
} = require('../utils')

function test(code, func) {
  return func(getASTSnippet(code))
}

function testExp(code, func) {
  return func(getASTSnippet(code).expression)
}

describe('utils', () => {
  describe('getLocalNamesByImport', () => {
    it('should get alias from ImportStatement', () => {
      let obj = test("import { GraphQLObjectType } from 'graphql'", getLocalNamesByImport)

      expect(obj.GraphQLObjectType).toEqual('GraphQLObjectType')

      obj = test("import { GraphQLObjectType as object } from 'graphql'", getLocalNamesByImport)

      expect(obj.object).toEqual('GraphQLObjectType')

      obj = test("import { GraphQLObjectType as object, GraphQLString } from 'graphql'", getLocalNamesByImport)

      expect(obj.object).toEqual('GraphQLObjectType')
      expect(obj.GraphQLString).toEqual('GraphQLString')
    })

    it('should not affected when importing other libs', () => {
      const obj = test("import { GraphQLObjectType as object } from 'other-lib'", getLocalNamesByImport)

      expect(obj.object).toNotEqual('GraphQLObjectType')
      expect(obj.GraphQLObjectType).toNotEqual('GraphQLObjectType')
    })
  })

  describe('getLocalNamesByRequire', () => {
    it('should get alias from RequireStatement', () => {
      let obj = test("const { GraphQLObjectType } = require('graphql')", getLocalNamesByRequire)

      expect(obj.GraphQLObjectType).toEqual('GraphQLObjectType')

      obj = test("const { GraphQLObjectType: object } = require('graphql')", getLocalNamesByRequire)

      expect(obj.object).toEqual('GraphQLObjectType')

      obj = test("const { GraphQLObjectType: object, GraphQLString } = require('graphql')", getLocalNamesByRequire)

      expect(obj.object).toEqual('GraphQLObjectType')
      expect(obj.GraphQLString).toEqual('GraphQLString')
    })

    it('should not affected when importing other libs', () => {
      const obj = test("const { GraphQLObjectType: object } = require('other-lib')", getLocalNamesByRequire)

      expect(obj.object).toNotBe('GraphQLObjectType')
      expect(obj.GraphQLObjectType).toNotBe('GraphQLObjectType')
    })
  })

  describe('is', () => {
    it('should assert node type', () => {
      const node = getASTSnippet('abc')
      expect(is('Identifier', node.expression)).toBeTruthy()
    })
  })

  describe('getFunctionExpressionReturn', () => {
    it('should get return values from function expression ', () => {
      let obj = testExp('(function() { return { a: 10 }})', getFunctionExpressionReturn)

      expect(obj.type).toEqual('ObjectExpression')
      expect(obj.properties[0].key.name).toEqual('a')
      expect(obj.properties[0].value.value).toEqual('10')

      obj = testExp('(function() { return globalVar })', getFunctionExpressionReturn)

      expect(obj.type).toEqual('Identifier')
      expect(obj.name).toEqual('globalVar')
    })
  })

  describe('getArrowFunctionExpressionReturn', () => {
    it('should get return values from arrow function expression ', () => {
      let obj = testExp('(() => { return { a: 10 }})', getArrowFunctionExpressionReturn)

      expect(obj.type).toEqual('ObjectExpression')
      expect(obj.properties[0].key.name).toEqual('a')
      expect(obj.properties[0].value.value).toEqual('10')

      obj = testExp('(() => { return globalVar })', getArrowFunctionExpressionReturn)

      expect(obj.type).toEqual('Identifier')
      expect(obj.name).toEqual('globalVar')

      obj = testExp('(() => ({ a: 10}))', getArrowFunctionExpressionReturn)

      expect(obj.type).toEqual('ObjectExpression')
      expect(obj.properties[0].key.name).toEqual('a')
      expect(obj.properties[0].value.value).toEqual('10')

      obj = testExp('(() => 10)', getArrowFunctionExpressionReturn)

      expect(obj.type).toEqual('Literal')
    })
  })

  describe('getThunkReturn', () => {
    it('should get return values from thunk', () => {
      let obj = testExp('(() => ({a : 10}))', getThunkReturn)

      expect(obj.type).toEqual('ObjectExpression')
      expect(obj.properties[0].key.name).toEqual('a')
      expect(obj.properties[0].value.value).toEqual('10')

      obj = testExp('(function() { return globalVar })', getThunkReturn)

      expect(obj.type).toEqual('Identifier')
      expect(obj.name).toEqual('globalVar')
    })
  })

  describe('getConstructorObjectConfig', () => {
    it('should returna object expressions or identifiers directly', () => {
      let obj = testExp('new GraphQLObjectType({ a: 10 })', getConstructorObjectConfig)

      expect(obj.type).toEqual('ObjectExpression')
      expect(obj.properties[0].type).toEqual('Property')
      expect(obj.properties[0].key.name).toEqual('a')

      obj = testExp('new GraphQLObjectType(config)', getConstructorObjectConfig)

      expect(obj.type).toEqual('Identifier')
      expect(obj.name).toEqual('config')
    })

    it('should get returned value if it\'s a thunk', () => {
      let obj = testExp('new GraphQLObjectType(() => ({ a: 10 }))', getConstructorObjectConfig)

      expect(obj.type).toEqual('ObjectExpression')
      expect(obj.properties[0].type).toEqual('Property')
      expect(obj.properties[0].key.name).toEqual('a')

      obj = testExp(`new GraphQLObjectType(function() {
        return { a: 10}
      })`, getConstructorObjectConfig)

      expect(obj.type).toEqual('ObjectExpression')
      expect(obj.properties[0].type).toEqual('Property')
      expect(obj.properties[0].key.name).toEqual('a')

      obj = testExp(`new GraphQLObjectType(() => {
        return { a: 10}
      })`, getConstructorObjectConfig)

      expect(obj.type).toEqual('ObjectExpression')
      expect(obj.properties[0].type).toEqual('Property')
      expect(obj.properties[0].key.name).toEqual('a')
    })

    it('should return `null` if it\'s not one of the "object", "thunk", "identifier"', () => {
      let obj = testExp('new GraphQLObjectType(() => 10)', getConstructorObjectConfig)

      expect(obj).toBe(null)

      obj = testExp('new GraphQLObjectType(() => "10")', getConstructorObjectConfig)

      expect(obj).toBe(null)

      obj = testExp(`new GraphQLObjectType(function() {
        return 10
      })`, getConstructorObjectConfig)

      expect(obj).toBe(null)
    })
  })

  describe('transformProperties', () => {
    it('should return object value with key.name as prop name', () => {
      const properties = [{
        key: {
          name: 'abc',
        }
      }, {
        key: {
          name: 'bcd'
        }
      }]

      const propsByKeyName = transformProperties(properties)

      expect(propsByKeyName.abc).toBe(properties[0])
      expect(propsByKeyName.bcd).toBe(properties[1])
    })
  })

  describe('createReport', () => {
    it('should create reports with "node" and "msg" props', () => {
      const report = createReport({}, 'invalid')

      expect(report.node).toBeTruthy()
      expect(report.msg).toBe('invalid')
    })

    it('should throw if "node" or "msg" is not provided', () => {
      const errors = []
      // eslint-disable-next-line
      let report

      try {
        report = createReport(null, 'invalid')
      } catch (err) {
        errors.push(err)
      }

      try {
        report = createReport({}, null)
      } catch (err) {
        errors.push(err)
      }

      expect(errors.length).toBe(2)
    })
  })

  describe('createTask', () => {
    it('should create a task with "typeName" and "node" props', () => {
      const report = createTask({}, 'GraphQLObjectType')

      expect(report.typeName).toBe('GraphQLObjectType')
      expect(report.node).toBeTruthy()
    })

    it('should throw if "typeName" or "node" is not provided', () => {
      const errors = []
      // eslint-disable-next-line
      let report

      try {
        report = createTask(null, 'invalid')
      } catch (err) {
        errors.push(err)
      }

      try {
        report = createTask({}, null)
      } catch (err) {
        errors.push(err)
      }

      expect(errors.length).toBe(2)
    })
  })
})
