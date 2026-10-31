import nx from '@nx/eslint-plugin'

import baseConfig from '../../eslint.config.mjs'

export default [
  { ignores: ['public/momo/**'] },
  ...baseConfig,
  ...nx.configs['flat/react']
]
