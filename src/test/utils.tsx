import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * カスタムレンダー関数
 * Providerなどをラップして提供
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    // 将来的にProviderをここで追加
    // 例: <ThemeProvider><RouterProvider>{children}</RouterProvider></ThemeProvider>
    return <>{children}</>
  }

  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: Wrapper, ...options })
  }
}

// re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }