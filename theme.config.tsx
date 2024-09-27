import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src="/logo.svg" alt="5318008 Logo" style={{ marginRight: '10px', height: '50px' }} />
      <span>5318008</span>
    </div>
  ),
  project: {
    link: 'https://www.5318008.io/',
  },
  chat: {
    link: '',
  },
  docsRepositoryBase: 'https://github.com/Spore-Labs/5318008docs',
  footer: {
    text: '5318008 Documentation',
  },
}

export default config
