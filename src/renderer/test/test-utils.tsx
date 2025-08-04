import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { BrowserRouter } from 'react-router-dom'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ReactFlowProvider>
        {children}
      </ReactFlowProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }