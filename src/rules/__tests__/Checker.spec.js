const expect = require('expect')
const { Checker } = require('../Checker')
const { getASTSnippet } = require('./parser')

function createMockContext() {
  const reports = []

  return {
    reports,
    report: (node, msg) => reports.push({ node, msg })
  }
}

describe('Checker', () => {
  let ctx
  let checker

  beforeEach(() => {
    ctx = createMockContext()
    checker = new Checker(ctx)
  })

  describe('alias', () => {
    function test(func, code) {
      func(getASTSnippet(code))
    }

    it('should extract alias info from import declaration', () => {
      const code = 'import { GraphQLObjectType as object } from "graphql"'
      test(checker.ImportDeclaration, code)

      expect(checker.alias.object).toBe('GraphQLObjectType')
    })

    it('should extract multiple alias info from import declaration', () => {
      let code = 'import { GraphQLObjectType as object } from "graphql"'

      test(checker.ImportDeclaration, code)
      expect(checker.alias.object).toBe('GraphQLObjectType')

      code = 'import { GraphQLString as string, GraphQLList } from "graphql"'

      test(checker.ImportDeclaration, code)
      expect(checker.alias.object).toBe('GraphQLObjectType')
      expect(checker.alias.string).toBe('GraphQLString')
      expect(checker.alias.GraphQLList).toBe('GraphQLList')
    })

    it('should extract alias info from require declaration', () => {
      const code = 'const { GraphQLObjectType: object } = require("graphql")'
      test(checker.VariableDeclaration, code)

      expect(checker.alias.object).toBe('GraphQLObjectType')
    })

    it('should extract multiple alias info from require declaration', () => {
      let code = 'const { GraphQLObjectType: object } = require("graphql")'

      test(checker.VariableDeclaration, code)
      expect(checker.alias.object).toBe('GraphQLObjectType')

      code = 'const { GraphQLString: string, GraphQLList } = require("graphql")'

      test(checker.VariableDeclaration, code)
      expect(checker.alias.object).toBe('GraphQLObjectType')
      expect(checker.alias.string).toBe('GraphQLString')
      expect(checker.alias.GraphQLList).toBe('GraphQLList')
    })
  })
})
