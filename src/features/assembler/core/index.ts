import { tokenize } from './tokenizer'
import { OperandType, Operand, Statement, parse } from './parser'
import {
  DuplicateLabelError,
  AssembleEndOfMemoryError,
  LabelNotExistError,
  JumpDistanceError
} from './exceptions'
import { unsign8 } from '@/common/utils'
import { Mnemonic } from '@/common/constants'

export type { SourceRange } from './types'
export type { AssemblerErrorObject } from './exceptions'
export { AssemblerError } from './exceptions'
export type { Statement } from './parser'

interface LabelToAddressMap {
  [labelIdentifier: string]: number
}

const getLabelToAddressMap = (statements: Statement[]): LabelToAddressMap => {
  let address = 0
  const labelToAddressMap: LabelToAddressMap = {}
  statements.forEach((statement, index) => {
    const { label, instruction, operands, machineCode } = statement
    if (label !== null) {
      if (label.identifier in labelToAddressMap) {
        throw new DuplicateLabelError(label)
      }
      labelToAddressMap[label.identifier] = address
    }
    const firstOperand = operands[0] as Operand | undefined
    if (instruction.mnemonic === Mnemonic.ORG) {
      address = firstOperand!.value as number
    } else {
      address += machineCode.length + (firstOperand?.type === OperandType.Label ? 1 : 0)
      if (address > 0xff && index !== statements.length - 1) {
        throw new AssembleEndOfMemoryError(statement)
      }
    }
  })
  return labelToAddressMap
}

export interface AddressToMachineCodeMap {
  [address: number]: number
}

export interface AddressToStatementMap {
  [address: number]: Statement
}

export type AssembleResult = [AddressToMachineCodeMap, AddressToStatementMap]

export const assemble = (input: string): AssembleResult => {
  const statements = parse(tokenize(input))
  const labelToAddressMap = getLabelToAddressMap(statements)
  let address = 0
  const addressToMachineCodeMap: AddressToMachineCodeMap = {}
  const addressToStatementMap: AddressToStatementMap = {}
  statements.forEach(statement => {
    const { instruction, operands, machineCode } = statement
    const firstOperand = operands[0] as Operand | undefined
    if (instruction.mnemonic === Mnemonic.ORG) {
      address = firstOperand!.value as number
      return
    }
    if (firstOperand?.type === OperandType.Label) {
      if (!(firstOperand.rawValue in labelToAddressMap)) {
        throw new LabelNotExistError(firstOperand)
      }
      const distance = labelToAddressMap[firstOperand.rawValue] - address
      if (distance < -128 || distance > 127) {
        throw new JumpDistanceError(firstOperand)
      }
      const unsignedDistance = unsign8(distance)
      firstOperand.value = unsignedDistance
      machineCode.push(unsignedDistance)
    }
    const nextAddress = address + machineCode.length
    machineCode.forEach((machineCode, index) => {
      addressToMachineCodeMap[address + index] = machineCode
    })
    addressToStatementMap[address] = statement
    address = nextAddress
  })
  return [addressToMachineCodeMap, addressToStatementMap]
}
