# Additional Rules

## Existing Project

The project structure is already created.

**Do NOT**

* Generate a new folder structure.
* Modify the existing project architecture.
* Rename existing folders or files.
* Create unnecessary files.

Only create or update files that are required for implementing the UI.

---

## Project Context

This prompt will be stored inside **`prompt.md`**.

Treat this file as the single source of truth for frontend implementation.

Always follow the instructions defined in this document throughout development.

Do not ignore or overwrite these rules.

---

## Implementation Rules

* Build the UI incrementally.
* Complete one page before moving to the next.
* Reuse components whenever possible.
* Prefer composition over duplication.
* Keep the code modular and maintainable.
* Write production-quality React and TypeScript code.
* Use functional components only.
* Keep components focused on a single responsibility.

---

## Styling Rules

* Use only Vanilla CSS.
* Do not introduce Tailwind CSS or any CSS framework.
* Use CSS variables for all colors, spacing, shadows, typography, and border radius.
* Reuse existing utility classes whenever possible.
* Avoid inline styles unless absolutely necessary.

---

## Design Rules

Follow this design system consistently.

Background : **#FAFAF9**

Cards : **#FFFFFF**

Primary : **#2F855A**

Accent : **#1F2937**

Rounded Corners : **16px**

Shadow : **Soft**

Spacing : **Large**

The interface should feel:

* Professional
* Minimal
* Modern
* Calm
* Premium
* Distraction-free

Do not use gradients, glassmorphism, neon effects, or overly decorative elements.

---

## Scope Restrictions

Do not implement features outside the project requirements.

The following are **out of scope**:

* User Authentication
* Login / Signup
* User Accounts
* Profile Management
* Persistent Conversation History
* Voice Interaction
* Notifications
* Settings
* Admin Dashboard
* Mobile Application
* Analytics Dashboard
* Dark Mode
* Charts (unless explicitly requested)

---

## Code Quality

* Use strict TypeScript typing.
* Write clean, readable code.
* Avoid unnecessary abstractions.
* Keep files small and maintainable.
* Use meaningful variable and component names.
* Handle loading, empty, and error states where appropriate.
* Write code that is easy to extend in future iterations.

---

## Development Workflow

Implement the project in this order:

1. Landing Page
2. Interview Page
3. Feedback Page

Do not jump ahead unless the current page is complete.

After completing each page:

* Ensure the UI is responsive.
* Verify visual consistency with the design system.
* Reuse existing components before creating new ones.
* Keep the implementation aligned with the existing project architecture.

---

## Final Goal

The objective is **not** to produce a flashy Dribbble-style design.

The objective is to build a clean, scalable, production-ready frontend foundation that can later be refined with improved visuals, animations, and interactions.
