interface TokenClaim {
  emails: string[]
  family_name: string
  given_name: string
}

export interface UserAccountModelInterface {
  environment: string
  homeAccountId: string
  idTokenClaims: TokenClaim
  localAccountId: string
  name: string
  tenantId: string
  username: string
}
