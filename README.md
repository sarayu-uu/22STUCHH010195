# URL Shortener Application

This is a web application designed to shorten long URLs and track their usage statistics. Users can input a long URL, receive a shortened version, and view analytics related to the shortened links.

## Features

*   **URL Shortening**: Convert long, cumbersome URLs into short, shareable links.
*   **Redirection**: Redirect users from the shortened URL to the original long URL.
*   **Statistics Tracking**: View detailed statistics for each shortened URL, including click counts.
*   **User-Friendly Interface**: A clean and intuitive interface built with React.

## Technologies Used

*   **Frontend**:
    *   React
    *   TypeScript
    *   HTML/CSS
*   **Build Tools**:
    *   npm (Node Package Manager)
    *   Webpack (implied by React setup)

## Setup

To get this project up and running on your local machine, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/sarayu-uu/22STUCHH010195.git
    cd affordmed
    ```

2.  **Install dependencies**:
    Navigate to the project root directory and install the necessary Node.js packages:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm start
    ```
    This will start the React development server, usually accessible at `http://localhost:3000`.

## Usage

Once the application is running:

1.  **Shorten a URL**:
    *   Navigate to the main page (e.g., `http://localhost:3000`).
    *   Enter a long URL into the provided input field.
    *   Click the "Shorten" button to generate a new short URL.

2.  **View Statistics**:
    *   Access the statistics page (e.g., `http://localhost:3000/statistics`).
    *   Here you can see a table listing all shortened URLs and their respective click counts.

## Project Structure

The project follows a standard React application structure:

*   `public/`: Contains public assets like `index.html` and `manifest.json`.
*   `src/`: Contains the main application source code.
    *   `src/App.tsx`: The main application component.
    *   `src/index.tsx`: Entry point for the React application.
    *   `src/components/`: Reusable UI components (e.g., `Navigation.tsx`, `UrlShortenerForm.tsx`).
    *   `src/hooks/`: Custom React hooks for logic encapsulation (e.g., `useUrlShortener.ts`, `useUrlStats.ts`).
    *   `src/pages/`: Top-level components representing different views/pages (e.g., `UrlShortenerPage.tsx`, `StatisticsPage.tsx`).
    *   `src/services/`: Modules for interacting with external services or APIs (e.g., `urlService.ts`).
    *   `src/types/`: TypeScript type definitions.
    *   `src/utils/`: Utility functions (e.g., `logger.ts`, `storage.ts`, `validation.ts`).

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).
