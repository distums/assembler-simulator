import React from 'react'
import HeaderBar from '../features/controller/HeaderBar'
import Editor from '../features/editor/Editor'
import Status from '../features/status/Status'
import IoDevices from '../features/io/IoDevices'
import CpuRegisters from '../features/cpu/CpuRegisters'
import Memory from '../features/memory/Memory'

const App = (): JSX.Element => (
  <div className="flex flex-col font-mono">
    <HeaderBar className="flex-none" />
    <div className="divide-x flex h-[calc(100vh-2rem)] mt-8">
      <div className="flex flex-col flex-1">
        <Editor className="h-full" />
        <Status />
      </div>
      <div className="divide-y flex flex-col flex-1 overflow-y-auto">
        <CpuRegisters />
        <Memory />
        <IoDevices />
      </div>
    </div>
  </div>
)

export default App
