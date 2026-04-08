export interface CredentialSource {
  type: 'header' | 'query' | 'body' | 'env' | 'vault'
  key: string
}

export interface CredentialTarget {
  type: 'header' | 'query' | 'body'
  key: string
  transform?: 'bearer' | 'basic' | 'raw'
}

export interface CredentialMapping {
  name: string
  description?: string
  required: boolean
  from: CredentialSource
  to: CredentialTarget
}

export interface ConfigSchema {
  credentials: CredentialMapping[]
}
