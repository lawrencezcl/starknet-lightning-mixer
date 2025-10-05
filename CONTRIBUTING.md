# Contributing to Starknet Lightning Mixer

Thank you for your interest in contributing to the Starknet Lightning Mixer! This guide will help you get started with contributing to our project.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and blockchain concepts
- Starknet wallet (for testing)

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork locally
   git clone https://github.com/YOUR_USERNAME/starknet-lightning-mixer.git
   cd starknet-lightning-mixer
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 How to Contribute

### 1. Bug Reports

Before creating a bug report, please check existing issues to avoid duplicates.

**Bug Report Template:**
```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome, Firefox]
- Node.js version: [e.g. 18.17.0]
- Application version: [e.g. 0.1.0]

## Additional Context
Add any other context about the problem here.
```

### 2. Feature Requests

We welcome feature requests! Please provide:

- Clear description of the feature
- Use case for the feature
- Implementation ideas (if any)
- Potential challenges or considerations

### 3. Code Contributions

#### Code Style

We follow these coding standards:

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Component Naming**: Use PascalCase for components
- **File Naming**: Use kebab-case for files

```typescript
// Example component
interface ComponentProps {
  title: string;
  onSubmit: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};
```

#### Pull Request Process

1. **Create Pull Request**
   - Provide a clear title and description
   - Link to related issues
   - Include screenshots if applicable

2. **Code Review**
   - Address all review comments
   - Keep discussions focused and constructive
   - Request review from team members

3. **Testing**
   - Ensure all tests pass
   - Add new tests for new features
   - Test on different browsers/devices

4. **Documentation**
   - Update relevant documentation
   - Add code comments where necessary
   - Update README if needed

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

We use Jest and React Testing Library for testing. Here's an example test:

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Coverage

Aim for:
- 80%+ code coverage for new features
- Unit tests for all utility functions
- Integration tests for key workflows
- E2E tests for critical user journeys

## 🏗️ Project Structure

```
starknet-lightning-mixer/
├── src/
│   ├── app/                    # Next.js pages
│   ├── components/            # React components
│   │   ├── common/            # Shared components
│   │   ├── layout/            # Layout components
│   │   ├── mixer/             # Mixer-specific components
│   │   └── ui/                # UI components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities
│   ├── store/                 # State management
│   └── types/                 # TypeScript definitions
├── server/                    # Backend code
├── docs/                      # Documentation
├── tests/                     # Test files
└── __tests__/                 # Test utilities
```

## 📝 Development Guidelines

### 1. Component Development

- Use functional components with hooks
- Implement proper TypeScript types
- Add accessibility attributes
- Include loading states
- Handle error states

```typescript
interface MixFormProps {
  onSubmit: (data: MixData) => void;
  isLoading?: boolean;
}

export const MixForm: React.FC<MixFormProps> = ({ onSubmit, isLoading = false }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await onSubmit({ amount });
    } catch (err) {
      setError('Failed to process mix request');
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Mix form">
      {/* Form content */}
    </form>
  );
};
```

### 2. State Management

- Use Zustand for global state
- Keep state minimal and normalized
- Use proper TypeScript types

```typescript
interface MixerStore {
  // State
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMixerStore = create<MixerStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction]
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
```

### 3. API Integration

- Use proper error handling
- Implement retry logic
- Add loading states
- Use TypeScript types

```typescript
export const createMix = async (params: CreateMixParams): Promise<MixResponse> => {
  try {
    const response = await fetch('/api/mixing/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create mix:', error);
    throw error;
  }
};
```

## 🎨 UI/UX Guidelines

### 1. Design System

- Use Tailwind CSS classes
- Follow established color palette
- Implement responsive design
- Ensure accessibility compliance

### 2. Component Design

- Keep components focused and reusable
- Use semantic HTML elements
- Implement proper ARIA attributes
- Add hover and focus states

```typescript
// Example accessible component
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};
```

## 🔐 Security Considerations

- Never commit sensitive data
- Validate all user inputs
- Use HTTPS for API calls
- Implement proper authentication
- Follow OWASP guidelines

## 📖 Documentation

### 1. Code Documentation

- Add JSDoc comments for functions
- Document complex logic
- Explain architectural decisions

```typescript
/**
 * Creates a new mixing transaction
 * @param params - Mixing parameters
 * @param params.amount - Amount to mix in ETH
 * @param params.recipient - Recipient wallet address
 * @returns Promise resolving to transaction details
 * @throws {Error} When amount is invalid or network error occurs
 */
export const createMix = async (params: CreateMixParams): Promise<Transaction> => {
  // Implementation
};
```

### 2. Documentation Updates

- Update README for new features
- Add API documentation for new endpoints
- Update architecture docs for changes
- Create user guides for complex features

## 🚀 Release Process

### 1. Versioning

We follow semantic versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Major versions for breaking changes
- Minor versions for new features
- Patch versions for bug fixes

### 2. Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version updated in package.json
- [ ] Code reviewed and approved
- [ ] Security checks completed

### 3. Publishing Releases

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release PR
4. Merge to main
5. Create GitHub release
6. Deploy to production

## 🤝 Community Guidelines

### 1. Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and considerate
- Use inclusive language
- Welcome newcomers and help them learn
- Focus on constructive feedback

### 2. Communication

- Use GitHub issues for bug reports and feature requests
- Use discussions for general questions
- Be patient and professional in all communications
- Provide helpful and constructive feedback

### 3. Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

## 🆘 Getting Help

### Resources

- [Documentation](./docs/)
- [API Reference](./docs/api.md)
- [Architecture Guide](./docs/architecture.md)
- [Deployment Guide](./docs/deployment.md)

### Support Channels

- Create an issue for bugs or questions
- Join our Discord community
- Check existing issues and discussions

## 📊 Contributor Statistics

Track your contributions:
- GitHub contributions graph
- Code reviews completed
- Issues resolved
- Documentation improvements

## 🎯 Good First Issues

Look for issues labeled `good first issue` to get started:
- Simple bug fixes
- Documentation improvements
- Small feature enhancements
- Test improvements

## 🏆 Recognition

Contributors will receive:
- GitHub contributor badge
- Recognition in release notes
- Invitation to private contributor channel
- Potential for maintainer role

---

Thank you for contributing to Starknet Lightning Mixer! Your contributions help make privacy more accessible to everyone.

If you have any questions or need help getting started, please don't hesitate to reach out to our maintainers.