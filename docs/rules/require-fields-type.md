# All fields properties(in GraphQLObjectType, GraphQLInterfaceType, GraphQLInputObjectType) need type properties(require-fields-type)

The `type` property is required by constructors of `GraphQLObjectType`, `GraphQLInterfaceType`, `GraphQLInputObjectType`.

## Rule Details

The following patterns are considered warnings:

```js
import { GraphQLObjectType, GraphQLInputObjectType,
  GraphQLInterfaceType } from 'graphql'

new GraphQLObjectType({
  fields: {
    a: {}
  }
})

new GraphQLInputObjectType({
  fields: () => ({
    a: {}
  })
})

new GraphQLInterfaceType({
  fields: function() {
    return {
      a: {}
    }
  }
})
```

The following partterns are not considered warnings:

```js
import { GraphQLObjectType, GraphQLInputObjectType,
  GraphQLInterfaceType } from 'graphql'

new GraphQLObjectType({
  fields: {
    a: {
      type: MyType
    }
  }
})

new GraphQLInputObjectType({
  fields: () => ({
    a: {
      type: MyType
    }
  })
})

new GraphQLInterfaceType({
  fields: function() {
    return {
      a: {
        type: MyType
      }
    }
  }
})
```
