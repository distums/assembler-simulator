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

const createToken = (
  type: TokenType,
  value: string,
  start: number,
  line: number,
  column: number
): Token => {
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
  const endColumn = column + value.length
  return {
    type,
    value: tokenValue,
    raw: value,
    start,
    end,
    loc: {
      start: {
        line,
        column
      },
      end: {
        line,
        column: endColumn
      }
    }
  }
}

type TokenMatcher = (input: string, index: number, line: number, column: number) => Token | null

const matchRegExp =
  (regex: RegExp, type: TokenType): TokenMatcher =>
  (input, index, line, column) => {
    const match = regex.exec(input.slice(index))
    return match !== null ? createToken(type, match[0], index, line, column) : null
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

const NEWLINE_REGEXP = /(?:\n|\r\n)/g

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  for (let index = 0, line = 1, column = 0; index < input.length; ) {
    for (let matcherIndex = 0; matcherIndex < tokenMatchers.length; matcherIndex++) {
      const token = tokenMatchers[matcherIndex](input, index, line, column)
      if (token !== null) {
        if (token.type !== TokenType.Whitespace && token.type !== TokenType.Comment) {
          tokens.push(token)
        }
        index = token.value === Mnemonic.END ? input.length : token.end
        const newlinesCount = (token.raw.match(NEWLINE_REGEXP) ?? []).length
        line += newlinesCount
        column = newlinesCount > 0 ? 0 : token.loc.end.column
        break
      }
    }
  }
  return tokens
}
