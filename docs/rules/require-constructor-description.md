# Require description property for constructors(require-constructor-description)

You can specify `description` properties in the constructors of:

- GraphQLScalarType
- GraphQLObjectType
- GraphQLInterfaceType
- GraphQLUnionType
- GraphQLEnumType
- GraphQLInputObjectType

Description allows you to description your custom type. This property would help other developers know more about the this type through schema introspections.

## Rule Details

The following patterns are considered warnings:

```js
import { GraphQLObjectType, GraphQLInterfaceType } from 'graphql'

new GraphQLObjectType({
  fields: {}
})

new GraphQLInterfaceType({
  fields: {}
})
```

The following partterns are not considered warnings:

```js
import { GraphQLObjectType, GraphQLInterfaceType } from 'graphql'

new GraphQLObjectType({
  description: 'This is my type',
  fields: {}
})

new GraphQLInterfaceType({
  description: 'This is my type',
  fields: {}
})
```
