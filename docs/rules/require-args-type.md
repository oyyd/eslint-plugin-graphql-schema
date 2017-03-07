# All args properties need type properties(require-args-type)

The `type` property is required by the `GraphQLArgumentConfig`.

## Rule Details

The following patterns are considered warnings:

```js
import { GraphQLObjectType } from 'graphql'

new GraphQLObjectType({
  name: 'account',
  fields: {
    a: {
      type: MyType,
      args: {}
    }
  }
})

new GraphQLObjectType({
  name: 'account',
  fields: () => ({
    a: {
      type: MyType,
      args: {}
    }
  })
})
```

The following partterns are not considered warnings:

```js
import { GraphQLObjectType } from 'graphql'

new GraphQLObjectType({
  name: 'account',
  fields: {
    a: {
      type: MyType,
      args: {
        type: MyType
      }
    }
  }
})

new GraphQLObjectType({
  name: 'account',
  fields: {
    a: {
      type: MyType,
    }
  }
})

new GraphQLObjectType({
  name: 'account',
  fields: () => ({
    a: {
      type: MyType,
      args: {
        type: MyType,
      }
    }
  })
})

```
