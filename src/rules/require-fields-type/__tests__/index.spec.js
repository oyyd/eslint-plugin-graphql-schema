const rule = require('../index')
const { RuleTester } = require('eslint')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
})

ruleTester.run('require-fields-type', rule, {
  valid: [
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      fields: {
        a: { type: abc }
      }
    })
    `,
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      fields: () => ({
        a: { type: abc }
      })
    })
    `,
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      fields: function() {
        return {
          a: { type: abc }
        }
      }
    })
    `,
    `import { GraphQLObjectType } from 'graphql'
    new GraphQLObjectType({
      fields: () => {
        return {
          a: { type: abc }
        }
      }
    })
    `,
    `import { GraphQLInterfaceType } from 'graphql'
    new GraphQLInterfaceType({
      fields: {
        abc: { type: abc }
      }
    })
    `,
    `import { GraphQLInputObjectType } from 'graphql'
    var GeoPoint = new GraphQLInputObjectType({
      name: 'GeoPoint',
      fields: {
        lat: { type: new GraphQLNonNull(GraphQLFloat) },
        lon: { type: new GraphQLNonNull(GraphQLFloat) },
        alt: { type: GraphQLFloat, defaultValue: 0 },
      }
    });
    `
  ],
  invalid: [
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
        fields: {
          a: { name: 10 }
        }
      })
      `,
      errors: ['expect "type" property']
    },
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
        fields: {
          a: { name: 10 },
          b: { abc: 20},
        }
      })
      `,
      errors: ['expect "type" property', 'expect "type" property']
    },
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
        fields: () => ({
          a: { name: 123 }
        })
      })
      `,
      errors: ['expect "type" property']
    },
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
        fields: () => {
          return {
            a: { name: 123 }
          }
        }
      })
      `,
      errors: ['expect "type" property']
    },
    {
      code: `import { GraphQLObjectType } from 'graphql'
      new GraphQLObjectType({
        fields: function() {
          return {
            a: { name: 123 }
          }
        }
      })
      `,
      errors: ['expect "type" property']
    },
    {
      code: `import { GraphQLInterfaceType } from 'graphql'
      new GraphQLInterfaceType({
        fields: {
          abc: {  }
        }
      })
      `,
      errors: ['expect "type" property']
    },
    {
      code: `import { GraphQLInputObjectType } from 'graphql'
      var GeoPoint = new GraphQLInputObjectType({
        name: 'GeoPoint',
        fields: {
          lat: { type: new GraphQLNonNull(GraphQLFloat) },
          lon: { },
          alt: { type: GraphQLFloat, defaultValue: 0 },
        }
      });
      `,
      errors: ['expect "type" property']
    }
  ],
})
