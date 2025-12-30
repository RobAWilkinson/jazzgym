<!--
SYNC IMPACT REPORT
==================
Version Change: [none] → 1.0.0
Rationale: Initial constitution ratification for JazzGym project

Modified Principles: N/A (initial version)
Added Sections:
  - Core Principles (3 principles: Simplicity First, User-First Design, Quality Over Speed)
  - Governance

Removed Sections: N/A (initial version)

Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with current principles
  ✅ spec-template.md - User-focused requirements align with User-First Design principle
  ✅ tasks-template.md - Optional testing aligns with Quality Over Speed principle
  ✅ Command files reviewed - No agent-specific references (Claude-only) requiring updates

Follow-up TODOs: None - all placeholders resolved
-->

# JazzGym Constitution

## Core Principles

### I. Simplicity First

**Principle**: Keep it simple. Avoid over-engineering. Build only what is needed now.

- Start with the simplest solution that solves the current problem
- YAGNI (You Aren't Gonna Need It): Do not add features, abstractions, or complexity for hypothetical future requirements
- Prefer straightforward implementations over clever ones
- When faced with complexity, first question whether it is necessary
- Three similar lines of code is better than a premature abstraction

**Rationale**: Complexity is the enemy of maintainability, reliability, and velocity. Simple systems are easier to understand, modify, and debug. Premature optimization and over-engineering create technical debt without delivering immediate value.

### II. User-First Design

**Principle**: User experience and user value drive all decisions.

- Every feature MUST solve a real user problem or need
- User scenarios and acceptance criteria define success, not technical achievements
- Features are designed from the user's perspective, not the system's internals
- When trade-offs arise, prioritize user impact over technical convenience
- Specifications MUST be written for non-technical stakeholders

**Rationale**: Software exists to serve users. Technical excellence without user value is waste. User-first thinking ensures we build the right thing, not just build things right.

### III. Quality Over Speed

**Principle**: Deliver reliable, well-crafted software. Rushing produces rework.

- Code quality, readability, and maintainability are non-negotiable
- Testing is encouraged and recommended for all significant features, though not strictly mandatory for every change
- Write tests when:
  - Adding new features with multiple components or edge cases
  - Changing critical functionality (authentication, payments, data integrity)
  - Fixing bugs to prevent regression
  - Building public APIs or reusable libraries
- Use judgment: trivial changes, one-liners, and simple fixes may not require tests
- Fix bugs properly rather than applying quick patches
- Take time to understand the problem before implementing
- Document non-obvious decisions and complex logic

**Rationale**: Fast delivery of broken software creates more work than careful initial implementation. Quality work the first time saves debugging, support burden, and reputation damage. Tests prevent regressions and document intended behavior.

## Governance

### Amendment Process

- Constitution changes require:
  1. Clear documentation of the proposed change
  2. Rationale for why the change improves the project
  3. Impact assessment on existing practices and templates
  4. Version increment following semantic versioning rules
  5. Update of all dependent templates and documentation

### Versioning Policy

Constitution version follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward incompatible changes (principle removal, fundamental redefinition)
- **MINOR**: New principles added or material expansion of guidance
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Compliance Review

- All design documents (specs, plans, tasks) MUST align with constitution principles
- Implementation plans include a "Constitution Check" section validating compliance
- Violations MUST be justified with:
  - Clear explanation of why the principle cannot be followed
  - Documentation of simpler alternatives considered and rejected
  - Specific reasoning for accepting the complexity

### Authority

- This constitution supersedes all other development practices and guidelines
- When practices conflict with constitutional principles, the constitution takes precedence
- Use `/speckit.constitution` command to update this document

**Version**: 1.0.0 | **Ratified**: 2025-12-30 | **Last Amended**: 2025-12-30
