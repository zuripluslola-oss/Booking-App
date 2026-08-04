```markdown
# Booking-App Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides guidance for contributing to the Booking-App repository, a TypeScript-based project with no detected framework. It covers established coding conventions, documentation workflows, and testing patterns to ensure consistency and maintainability across the codebase.

## Coding Conventions

### File Naming
- Use **snake_case** for all file names.
  - Example: `booking_engine.ts`, `user_profile.ts`

### Import Style
- Use **relative imports** for referencing other modules.
  - Example:
    ```typescript
    import { BookingEngine } from './booking_engine';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In booking_engine.ts
    export function createBooking() { ... }
    export const BOOKING_STATUS = { ... };
    ```

### Commit Messages
- Follow **conventional commit** patterns.
- Use the `docs:` prefix for documentation-related commits.
  - Example:  
    ```
    docs: update booking engine specification
    ```

## Workflows

### Add or Update Documentation File
**Trigger:** When you want to document new information or update existing documentation about the project.  
**Command:** `/add-doc`

1. Create or update a markdown file in the `docs/` directory or its subdirectories.
   - Examples:
     - `docs/PRODUCT_VISION_AND_ROADMAP.md`
     - `docs/specs/booking-engine-spec.md`
     - `docs/research/services-research.md`
     - `docs/CURRENT_STATUS.md`
2. Commit the changes with a message prefixed by `docs:`.
   - Example:
     ```
     docs: add research on booking services
     ```
3. Push your changes and open a pull request if required.

## Testing Patterns

- Test files use the pattern `*.test.*` (e.g., `booking_engine.test.ts`).
- The specific testing framework is not detected; follow existing patterns in the repository.
- Place test files alongside the modules they test or in a dedicated test directory as per project convention.
- Example test file name: `user_profile.test.ts`

## Commands

| Command   | Purpose                                                      |
|-----------|--------------------------------------------------------------|
| /add-doc  | Add or update documentation files in the `docs/` directory   |
```