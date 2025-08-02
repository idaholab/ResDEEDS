# Testing Guide for ResDEEDS Flow

This document provides guidance on running and writing tests for the ResDEEDS Flow Electron application.

## Overview

The project uses Vitest as the testing framework with React Testing Library for component testing. Tests are organized into three categories:

- **Unit Tests**: Individual components and utility functions
- **Integration Tests**: Component interactions and workflows
- **Setup Tests**: Environment and configuration validation

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests once (CI mode)
pnpm test:run

# Generate coverage report
pnpm test:coverage

# Open test UI dashboard
pnpm test:ui
```

### Test File Patterns

- `*.test.ts` - TypeScript unit tests
- `*.test.tsx` - React component tests
- `*.test.js` - JavaScript utility tests

## Test Structure

### Unit Tests

Located alongside source files:
```
src/
├── components/
│   ├── nodes/
│   │   ├── BusNode.tsx
│   │   └── BusNode.test.tsx
│   └── modals/
│       ├── PropertyEditModal.tsx
│       └── PropertyEditModal.test.tsx
├── utils/
│   ├── pypsa-exporter.js
│   ├── pypsa-exporter.test.js
│   ├── diagram-storage.js
│   └── diagram-storage.test.js
```

### Integration Tests

Located in the test directory:
```
src/renderer/test/
├── integration/
│   └── diagram-workflow.test.tsx
├── setup.ts
├── setup.test.ts
└── test-utils.tsx
```

## Test Coverage

Current coverage targets:
- **Statements**: 80%
- **Branches**: 80% 
- **Functions**: 80%
- **Lines**: 80%

### Coverage Report

The coverage report is generated in:
- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Utility Tests

```javascript
import { describe, it, expect, vi } from 'vitest'
import { myUtilFunction } from './my-util'

describe('myUtilFunction', () => {
  it('processes data correctly', () => {
    const result = myUtilFunction(inputData)
    expect(result).toEqual(expectedOutput)
  })
})
```

### Mocking

#### Electron APIs
```typescript
// Automatically mocked in setup.ts
expect(window.electron.api.saveFile).toHaveBeenCalled()
```

#### React Flow
```typescript
// Automatically mocked in setup.ts
// Use test-utils for components that need ReactFlowProvider
```

#### File System Operations
```typescript
import { vi } from 'vitest'

vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('file content'),
  writeFile: vi.fn().mockResolvedValue()
}))
```

## Test Environment

### Setup Files

- `src/renderer/test/setup.ts` - Global test configuration
- `src/renderer/test/test-utils.tsx` - Custom render utilities

### Mocked Dependencies

The following are automatically mocked:
- Electron APIs (`window.electron`)
- React Flow components
- File system operations
- Console warnings

### Environment Variables

Tests run in the `happy-dom` environment, providing DOM APIs without a real browser.

## Common Patterns

### Testing User Interactions

```typescript
import { fireEvent, waitFor } from '@testing-library/react'

it('handles user input', async () => {
  render(<MyComponent />)
  
  const input = screen.getByLabelText('Input Label')
  fireEvent.change(input, { target: { value: 'new value' } })
  
  await waitFor(() => {
    expect(input).toHaveValue('new value')
  })
})
```

### Testing Async Operations

```typescript
it('handles async operations', async () => {
  const mockFn = vi.fn().mockResolvedValue('success')
  
  render(<MyComponent onSave={mockFn} />)
  
  fireEvent.click(screen.getByText('Save'))
  
  await waitFor(() => {
    expect(mockFn).toHaveBeenCalled()
  })
})
```

### Testing Error States

```typescript
it('handles errors gracefully', async () => {
  const mockFn = vi.fn().mockRejectedValue(new Error('Failed'))
  
  render(<MyComponent onAction={mockFn} />)
  
  fireEvent.click(screen.getByText('Action'))
  
  await waitFor(() => {
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })
})
```

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow the AAA pattern**: Arrange, Act, Assert
4. **Test behavior, not implementation**

### Mocking Guidelines

1. **Mock external dependencies** (APIs, file system)
2. **Avoid mocking implementation details**
3. **Use real data structures** when possible
4. **Reset mocks between tests**

### Performance

1. **Use `beforeEach`** for test setup
2. **Clean up resources** with `afterEach`
3. **Avoid unnecessary DOM queries**
4. **Use `screen.getBy*`** instead of container queries

## Troubleshooting

### Common Issues

#### Test Timeouts
```typescript
// Increase timeout for slow operations
await waitFor(() => {
  expect(element).toBeInTheDocument()
}, { timeout: 5000 })
```

#### Mock Not Working
```typescript
// Ensure mocks are cleared between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

#### TypeScript Errors
```typescript
// Add type assertions for test data
const mockNode = {
  id: 'test',
  type: 'busNode' as const,
  position: { x: 0, y: 0 },
  data: { label: 'Test' }
}
```

### Debugging

1. **Use `screen.debug()`** to inspect rendered DOM
2. **Add `console.log`** statements in tests
3. **Run specific tests** with `--reporter=verbose`
4. **Check coverage report** for untested code paths

## CI/CD Integration

Tests are configured to run in CI environments with:
- Automated test execution
- Coverage reporting
- Fail on coverage below thresholds
- Parallel test execution

For GitHub Actions integration, add to your workflow:

```yaml
- name: Run tests
  run: pnpm test:run

- name: Generate coverage
  run: pnpm test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```