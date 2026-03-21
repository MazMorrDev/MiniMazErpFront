# MiniMazERP - Frontend Web

[![Angular](https://img.shields.io/badge/Angular-21.0.0-red?logo=angular)](https://angular.io/)
[![Package Manager](https://img.shields.io/badge/pnpm-pnpm--lock.yaml-blue?logo=pnpm)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

This repository contains the frontend for **MiniMazERP**, a small-scale Enterprise Resource Planning (ERP) application. It is built with **Angular 21** and designed to provide a modern and efficient user interface for inventory management and other business processes.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
- [Building for Production](#building-for-production)
- [Available Scripts](#available-scripts)
- [Running Tests](#running-tests)
- [Environment Configuration](#environment-configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

MiniMazERP aims to simplify business operations by providing an intuitive interface for managing core ERP functionalities. The frontend focuses on delivering a responsive, accessible, and user-friendly experience that communicates with a backend API (hosted in a separate repository) to perform CRUD operations on business data.

## Key Features

Based on the commit history and project structure, the application includes:

- **Inventory Management:** Product visualization with visual stock indicators (e.g., colors for low stock, implemented in commit `fix: stock colors when low stock now work properly`).
- **Reactive Interface:** Built with Angular components for a smooth user experience and real-time updates.
- **Modular Design:** Code organized into components, services, and modules following Angular best practices.
- **Pure Frontend Architecture:** No Server-Side Rendering (SSR), simplifying deployment as a Single Page Application (SPA).
- **Responsive Design:** Optimized for various screen sizes using Angular Material's responsive capabilities.
- **Data Validation:** Form validation using Angular's reactive forms.
- **Error Handling:** Global error handling mechanisms for improved user experience.

## Technology Stack

- **Core Framework:** [Angular CLI](https://angular.io/cli) version 21.0.5.
- **Language:** TypeScript ~5.9.3.
- **Package Manager:** `pnpm`@10.27.0 (based on `pnpm-lock.yaml`).
- **UI Library:** [Angular Material](https://material.angular.io/) 21.0.3 and [Angular CDK](https://material.angular.io/cdk/categories) 21.0.3.
- **State Management:** RxJS 7.8.2 for reactive programming.
- **Styling:** SCSS (Sass) for component and global styles.
- **Unit Testing:** [Karma](https://karma-runner.github.io/) with [Jasmine](https://jasmine.github.io/) (default Angular configuration).
- **Development Tools:** Prettier for code formatting, Vitest for additional testing capabilities.

## Project Structure

The project follows the conventional structure of an Angular workspace:

```text
MiniMazERP-Web/
├── .vscode/             # Visual Studio Code editor settings
├── src/                  # Application source code
│   ├── app/              # Main modules, components, services, and directives
│   │   ├── core/         # Core module (singleton services, etc.)
│   │   ├── features/     # Feature modules (e.g., inventory, sales)
│   │   └── shared/       # Shared components, directives, pipes
│   ├── assets/           # Images, global styles, and other static resources
│   ├── environments/     # Configuration for different environments (dev, prod)
│   └── ... (other Angular configuration files)
├── .editorconfig         # Configuration to maintain consistent coding styles
├── angular.json          # Main Angular workspace configuration
├── package.json          # Project dependencies and scripts
├── pnpm-lock.yaml        # Exact dependency versions (pnpm)
├── README.md             # This file
├── tsconfig.json         # Base TypeScript configuration
├── tsconfig.app.json     # TypeScript configuration for the application
└── tsconfig.spec.json    # TypeScript configuration for tests
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- **Node.js:** Ensure you have a version compatible with Angular 21 installed (typically Node.js 18.19 or higher). You can download it from [nodejs.org](https://nodejs.org/).
- **pnpm:** This project uses `pnpm` instead of `npm`. Install it globally if you don't have it:

  ```bash
  npm install -g pnpm
  ```

- **Angular CLI:** Install the Angular CLI globally (optional but recommended):

  ```bash
  npm install -g @angular/cli
  ```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MazMorrDev/MiniMazERP-Web.git
   ```

2. Navigate to the project directory:

   ```bash
   cd MiniMazERP-Web
   ```

3. Install dependencies using `pnpm`:

   ```bash
   pnpm install
   ```

### Development Server

Run the following command to start a development server. The application will automatically reload if you change any of the source files.

```bash
pnpm ng serve
# or if you have Angular CLI installed globally
ng serve
```

Open your browser and navigate to `http://localhost:4200/`.

## Building for Production

Run the following command to build the project for production. The build artifacts will be stored in the `dist/` directory.

```bash
pnpm ng build
# or
ng build
```

By default, the production build optimizes the application for performance and speed.

## Available Scripts

In the `package.json`, you'll find the following scripts:

- `ng serve` - Starts the development server.
- `ng build` - Builds the application for production.
- `ng build --watch` - Builds the application and watches for changes (development).
- `ng test` - Runs unit tests via Karma.
- `ng e2e` - Runs end-to-end tests (if configured).


## Environment Configuration

The application uses environment-specific configuration files located in `src/environments/`:

- `environment.ts` - Default environment (used for production builds).
- `environment.development.ts` - Development environment overrides.

To configure the backend API URL, modify the `apiUrl` property in the appropriate environment file.

Example (`environment.development.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // Example backend URL
};
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them with descriptive messages.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a Pull Request against the `main` branch of the original repository.

Please ensure your code adheres to the existing style and passes all tests. We follow the Angular coding conventions and use Prettier for formatting.

## License

All rights are reserved. This software is proprietary.

## Contact

- **Creator/Owner:** [MazMorrDev](https://github.com/MazMorrDev)