import type { Locatable } from './types'
import { Mnemonic } from '../../../common/constants'
import { trimBracketsAndQuotes, call } from '../../../common/utils'

export enum TokenType {
  Whitespace = 'Whitespace',
  Comment = 'Comment',
  Comma = 'Comma',
  Digits = 'Digits',
  Register = 'Register',
  Address = 'Address',
  String = 'String',
  Unknown = 'Unknown'
}

export interface Token extends Locatable {
  type: TokenType
  value: string
  raw: string
}

const createToken = (type: TokenType, value: string, start: number): Token => {
  const tokenValue = call((): string => {
    const normalizedValue = trimBracketsAndQuotes(value)
    switch (type) {
      case TokenType.Register:
      case TokenType.Address:
      case TokenType.Unknown:
        return normalizedValue.toUpperCase()
      default:
        return normalizedValue
    }
  })
  const end = start + value.length
  return {
    type,
    value: tokenValue,
    raw: value,
    start,
    end
  }
}

type TokenMatcher = (input: string, index: number) => Token | null

const matchRegExp =
  (regex: RegExp, type: TokenType): TokenMatcher =>
  (input, index) => {
    const match = regex.exec(input.slice(index))
    return match !== null ? createToken(type, match[0], index) : null
  }

const tokenMatchers = [
  matchRegExp(/^\s+/, TokenType.Whitespace),
  matchRegExp(/^;.*/, TokenType.Comment),
  matchRegExp(/^,/, TokenType.Comma),
  matchRegExp(/^\d+\b/, TokenType.Digits),
  matchRegExp(/^[a-dA-D][lL]\b/, TokenType.Register),
  matchRegExp(/^\[\S*?\](?=[\s;,]|$)/, TokenType.Address),
  matchRegExp(/^"[^\r\n]*?"(?=[\s;,]|$)/, TokenType.String),
  matchRegExp(/^[^\s;,]+/, TokenType.Unknown)
]

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  for (let index = 0; index < input.length; ) {
    for (let matcherIndex = 0; matcherIndex < tokenMatchers.length; matcherIndex++) {
      const token = tokenMatchers[matcherIndex](input, index)
      if (token !== null) {
        if (token.type !== TokenType.Whitespace && token.type !== TokenType.Comment) {
          tokens.push(token)
        }
        index = token.value === Mnemonic.END ? input.length : token.end
        break
      }
    }
  }
  return tokens
}
