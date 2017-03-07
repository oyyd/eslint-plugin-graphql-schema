# Report missing properties required by type constructors(require-constructor-props)

Some config properties are required by type constructors:

- GraphQLSchema: ['query'],
- GraphQLScalarType: ['name', 'serialize'],
- GraphQLObjectType: ['name', 'fields'],
- GraphQLInterfaceType: ['name', 'fields'],
- GraphQLUnionType: ['name', 'types'],
- GraphQLEnumType: ['name', 'values'],
- GraphQLInputObjectType: ['name', 'fields'],

## Rule Details

The following patterns are considered warnings:

```js
import { GraphQLSchema, GraphQLObjectType } from 'graphql'

new GraphQLSchema({})
new GraphQLObjectType({ fields: {} })
```

The following partterns are not considered warnings:

```js
import { GraphQLSchema, GraphQLObjectType } from 'graphql'

const AccountType = new GraphQLObjectType({
  name: 'account',
  fields: {}
})

new GraphQLSchema({
  query: AccountType
})
```
