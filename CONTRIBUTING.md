# Contributing to react-native-draggable-kit

Thank you for your interest in contributing! This document provides guidelines and setup instructions.

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+
- React Native development environment ([setup guide](https://reactnative.dev/docs/environment-setup))

### Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-org/react-native-draggable-kit.git
   cd react-native-draggable-kit
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run quality checks:**

   ```bash
   npm run lint        # ESLint
   npm run typecheck   # TypeScript
   npm test            # Jest tests
   npm run build       # Build output
   ```

4. **Run the example app:**

   ```bash
   cd example
   npm install
   npx expo prebuild   # generates ios/ and android/ dirs
   npx expo run:ios     # or run:android
   ```

## Project Structure

```
├── src/
│   ├── index.ts                 # Public API barrel export
│   ├── types.ts                 # All TypeScript interfaces
│   ├── constants.ts             # Default values and configs
│   ├── context.ts               # React context for shared values
│   ├── DraggableList.tsx        # Primary component
│   ├── SortableItem.tsx         # Individual item wrapper
│   ├── DragHandle.tsx           # Drag handle component
│   ├── hooks/
│   │   ├── useDraggableList.ts  # Core hook
│   │   ├── useAutoScroll.ts     # Auto-scroll logic
│   │   └── useItemMeasurements.ts # Item size tracking
│   └── utils/
│       ├── reorder.ts           # Pure reorder functions
│       └── accessibility.ts     # A11y action generators
├── __tests__/                   # Test files
├── example/                     # Example app
├── lib/                         # Build output (gitignored)
└── .github/workflows/ci.yml    # CI pipeline
```

## Code Style

- **TypeScript strict mode** — No `any` types without a justifying comment.
- **ESLint + Prettier** — Run `npm run lint` before committing.
- **No console.log** — Use proper error boundaries or remove debug statements.
- **Worklet directive** — All functions that run on the UI thread must have `'worklet';` as their first statement.

## Pull Request Guidelines

1. **Create a feature branch** from `main`.
2. **Write tests** for new functionality.
3. **Add a changeset** if your change affects the public API:
   ```bash
   npx changeset
   ```
4. **Ensure CI passes** — lint, typecheck, test, build.
5. **Keep PRs focused** — one feature or fix per PR.

## Reporting Issues

When reporting a bug, please include:

- React Native version
- Reanimated version
- Gesture Handler version
- Platform (iOS/Android)
- Minimal reproduction steps
- Device/simulator info

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
