# MiniMazERP - Frontend Web

[![Angular](https://img.shields.io/badge/Angular-21.0.0-red?logo=angular)](https://angular.io/)
[![Package Manager](https://img.shields.io/badge/pnpm-pnpm--lock.yaml-blue?logo=pnpm)](https://pnpm.io/)

This repository contains the frontend for **MiniMazERP**, a small-scale Enterprise Resource Planning (ERP) application. It is built with **Angular 21** and designed to provide a modern and efficient user interface for inventory management and other business processes.

## 🚀 Key Features (Inferred)

Based on the commit history and project structure, the application includes:

* **Inventory Management:** Product visualization with visual stock indicators (e.g., colors for low stock, implemented in commit `fix: stock colors when low stock now work properly`).
* **Reactive Interface:** Built with Angular components for a smooth user experience and real-time updates.
* **Modular Design:** Code organized into components, services, and modules following Angular best practices.
* **Pure Frontend Architecture:** No Server-Side Rendering (SSR), simplifying deployment as a Single Page Application (SPA).

## 🛠️ Built With

* **Core Framework:** [Angular CLI](https://angular.io/cli) version 21.0.0.
* **Language:** TypeScript.
* **Package Manager:** `pnpm` (based on `pnpm-lock.yaml`).
* **Styling:** SCSS (inferred from common Angular project structures).
* **Unit Testing:** Karma (default Angular configuration).

## 📁 Project Structure

The project follows the conventional structure of an Angular workspace:

```text
MiniMazERP-Web/
├── .vscode/             # Visual Studio Code editor settings
├── src/                  # Application source code
│   ├── app/              # Main modules, components, services, and directives
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

## 💻 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* **Node.js:** Ensure you have a version compatible with Angular 21 installed (typically Node.js 18.19 or higher). You can download it from [nodejs.org](https://nodejs.org/).
* **pnpm:** This project uses `pnpm` instead of `npm`. Install it globally if you don't have it:

    ```bash
    npm install -g pnpm
    ```

* **Angular CLI:** Install the Angular CLI globally (optional but recommended):

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

## 📦 Building for Production

Run the following command to build the project for production. The build artifacts will be stored in the `dist/` directory.

```bash
pnpm ng build
# or
ng build
```

By default, the production build optimizes the application for performance and speed.

## 📜 Available Scripts

In the `package.json`, you'll find the standard Angular scripts:

* `ng serve` - Starts the development server.
* `ng build` - Builds the application.
* `ng test` - Runs unit tests.
* `ng generate` - Uses scaffolding to generate components, services, etc.

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change or add. Ensure you follow the coding conventions established in the `.editorconfig` file.

## 📄 License

*All rights are reserved.*

## 📞 Contact

* **Creator/Owner:** [MazMorrDev](https://github.com/MazMorrDev)
* **Repository:** [https://github.com/MazMorrDev/MiniMazERP-Web](https://github.com/MazMorrDev/MiniMazERP-Web)
