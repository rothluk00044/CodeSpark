# CodeSpark - Interactive JavaScript Playground

CodeSpark is a web-based interactive JavaScript code editor and execution environment. It allows users to write, run, and manage JavaScript code snippets directly in the browser, providing instant feedback on their code. This project is designed as a full-stack application, demonstrating client-side code execution and local data persistence without requiring a backend database or external accounts.

## Features

*   **Interactive Code Editor**: Write JavaScript code with line numbers and a clean interface.
*   **Live Output Console**: See the `console.log()` output and the return value of the last expression immediately after execution.
*   **Code Snippet Management**:
    *   **Save**: Persist your current code to local storage.
    *   **Save As New**: Create new named snippets from your current code.
    *   **Load**: Load previously saved snippets into the editor.
    *   **Delete**: Remove unwanted snippets.
    *   **Export (Simulated)**: A simulated export function for all saved snippets, demonstrating potential integration with backend services.
*   **Responsive Design**: Optimized for both desktop and mobile views, with a tabbed interface for mobile.
*   **Modern UI**: Built with Next.js, React, Tailwind CSS, and shadcn/ui components, featuring a dark theme and gradient accents.
*   **Client-Side Execution**: All code execution happens securely within the browser environment.

## Technologies Used

*   **Framework**: Next.js (App Router)
*   **UI Library**: React
*   **Styling**: Tailwind CSS
*   **Components**: shadcn/ui
*   **Icons**: Lucide React
*   **Toast Notifications**: Sonner
*   **Unique IDs**: `uuid`
*   **Local Storage**: For client-side data persistence.
*   **Server Actions**: Simulated backend operations for saving and exporting (actual persistence is client-side).

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository (if applicable)**:
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```
    *If you received this project directly, skip this step.*

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
    or
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Run the development server**:
    ```bash
    pnpm dev
    ```
    or
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

*   **Write Code**: Type your JavaScript code in the left panel (or "Code" tab on mobile).
*   **Run Code**: Click the "Run" button to execute your code. The output will appear in the right panel (or "Output" tab on mobile).
*   **Save Current Code**: Click "Save" to update the currently loaded snippet (if any) in local storage.
*   **Save As New Snippet**: Click "Snippets" then "Save As New" to save your current code as a new named snippet.
*   **Load Snippet**: Open the "Snippets" sidebar and click on a saved snippet to load it into the editor.
*   **Delete Snippet**: In the "Snippets" sidebar, click the trash icon next to a snippet to delete it.
*   **Export All**: In the "Snippets" sidebar, click "Export All" to simulate exporting all your saved snippets.

## Project Structure Highlights

*   `app/page.tsx`: The main page component, orchestrating the editor, console, and snippet management UI.
*   `components/code-editor.tsx`: The interactive code input area with line numbers.
*   `components/output-console.tsx`: Displays the execution output and errors.
*   `hooks/use-code-playground.ts`: Custom React hook encapsulating the core logic for code execution, local storage persistence, and snippet management.
*   `lib/actions.ts`: Next.js Server Actions simulating backend interactions for saving and exporting data.
*   `components/ui/*`: Shadcn/ui components used for building the UI.