const rule = require('../index')
const { RuleTester } = require('eslint')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
})

ruleTester.run('require-args-type', rule, {
  valid: [
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      fields: {
        a: {
          type: abc,
          args: {
            type: abc
          }
        }
      }
    })
    `,
    `import { GraphQLInterfaceType } from 'graphql'
    new GraphQLInterfaceType({
      fields: {
        a: {
          type: abc,
          args: {
            type: abc
          }
        }
      }
    })
    `,
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      fields: {
        a: {
          type: abc,
          args: abc
        }
      }
    })
    `,
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      fields: {
        a: {
          type: abc,
        }
      }
    })
    `,
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      fields: {
        args: {

        },
        a: {
          type: abc,
        }
      }
    })
    `,
  ],
  invalid: [
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
        fields: {
          a: {
            type: abc,
            args: {
            }
          }
        }
      })
      `,
      errors: ['expect "type" property']
    }
  ],
})
