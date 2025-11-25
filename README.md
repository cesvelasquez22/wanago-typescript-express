# Wanago TypeScript Express Tutorial

This repository contains the code examples for the [TypeScript Express Tutorial](https://wanago.io/courses/typescript-express-tutorial/) on Wanago.io.

## Getting Started
To get started with the code examples, follow these steps:
1. Clone the repository:
   ```bash
   git clone
2. Navigate to the project directory:
   ```bash
   cd typescript-express-tutorial
   ```
3. Install the dependencies:
   ```bash
   npm install
4. Run docker-compose to set up the database:
   ```bash
   docker-compose up -d
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open your browser and go to `http://localhost:3000` to see the application in action.
## Project Structure
The project is structured as follows:
```
typescript-express-tutorial/
├── src/
│   ├── [controller]/[controller].ts
│   ├── app.ts
│   └── server.ts
├── tests/
├── package.json
├── tsconfig.json
└── README.md
```
- `src/`: Contains the source code for the application.
- `[controller]/[controller].ts`: Contains the controller files that handle incoming requests.
- `app.ts`: The main application file where the Express app is configured.
- `server.ts`: The entry point of the application that starts the server.
- `tests/`: Contains the test files for the application.
- `package.json`: Contains the project metadata and dependencies.
- `tsconfig.json`: TypeScript configuration file.
- `README.md`: This file.

## Migrations
The project uses TypeORM for database migrations. To run migrations, use the following command:
```bash
npm run typeorm:cli migration:run
```
To create a new migration, use:
```bash
npm run typeorm migration:create migrations/[MigrationName]
```
To revert the last migration, use:
```bash
npm run typeorm:cli migration:revert
```

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an
issue or submit a pull request.
## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
## Acknowledgments
- [Wanago.io](https://wanago.io) for the tutorial content.
- [Express](https://expressjs.com/) for the web framework.
- [TypeScript](https://www.typescriptlang.org/) for the programming language.
- [Node.js](https://nodejs.org/) for the runtime environment.
