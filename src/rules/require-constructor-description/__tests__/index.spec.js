const rule = require('../index')
const { RuleTester } = require('eslint')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
})

ruleTester.run('require-schema-resolve', rule, {
  valid: [
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      description: 'abc'
    })
    `,
    `import { GraphQLInterfaceType } from 'graphql'
    new GraphQLInterfaceType({
      description: 'abc'
    })
    `
  ],
  invalid: [
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
      })
      `,
      errors: ['expect "description" property'],
    },
    {
      code: `import { GraphQLInterfaceType } from 'graphql'
      new GraphQLInterfaceType({
      })
      `,
      errors: ['expect "description" property'],
    }
  ],
})
