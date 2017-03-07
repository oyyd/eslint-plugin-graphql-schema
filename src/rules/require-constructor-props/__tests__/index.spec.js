const rule = require('../index')
const { RuleTester } = require('eslint')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
})

ruleTester.run('require-constructor-props', rule, {
  valid: [
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      name: 123,
      fields: 123
    })
    `,
    `import { GraphQLObjectType as ObjectType } from 'graphql'
    new ObjectType({
      name: 123,
      fields: 123
    })
    `,
    `new GraphQLObjectType({})
    `,
    `import { GraphQLScalarType } from 'graphql'
    new GraphQLScalarType({
      name: 'abc',
      serialize: () => {}
    })
    `,
    `import { Invalid } from 'graphql'
    new Invali({})
    `,
  ],
  invalid: [
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
        name: '123',
      })
      `,
      errors: ['expect "fields" property']
    },
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
        fields: {}
      })
      `,
      errors: ['expect "name" property']
    },
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
      })
      `,
      errors: ['expect "name" property', 'expect "fields" property']
    },
    {
      code: `import { GraphQLScalarType } from 'graphql'
      new GraphQLScalarType({
        name: 'abc',
      })
      `,
      errors: ['expect "serialize" property']
    },
  ],
})
