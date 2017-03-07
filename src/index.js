/* eslint-disable global-require*/
const rules = {
  'require-args-type': require('./rules/require-args-type'),
  'require-constructor-description': require('./rules/require-constructor-description'),
  'require-constructor-props': require('./rules/require-constructor-props'),
  'require-fields-type': require('./rules/require-fields-type'),
}
/* eslint-enable global-require*/

module.exports = {
  rules,
  configs: {
    recommended: {
      plugins: [
        'graphql-schema',
      ],
      parserOptions: {
        ecmaVersion: 2015,
        sourceType: 'module'
      },
      rules: {
        'graphql-schema/require-args-type': 2,
        'graphql-schema/require-fields-type': 2,
        'graphql-schema/require-constructor-description': 0,
        'graphql-schema/require-constructor-props': 2,
      },
    },
    all: {
      plugins: [
        'graphql-schema',
      ],
      parserOptions: {
        ecmaVersion: 2015,
        sourceType: 'module'
      },
      rules: {
        'graphql-schema/require-args-type': 2,
        'graphql-schema/require-fields-type': 2,
        'graphql-schema/require-constructor-description': 2,
        'graphql-schema/require-constructor-props': 2,
      },
    }
  },
}
