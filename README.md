# BoardHub

BoardHub is a ready-to-deploy project management application inspired by Kanban boards, designed to help teams organize tasks and collaborate effectively. Built with a serverless architecture and MongoDB, it offers a free, scalable solution for project management. Deploy it effortlessly on Vercel and start managing your projects today.


![Home Page](/github-readme-assets/home.png)

---

## Table of Contents
- [Features](#features)
- [Technical Details](#technical-details)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Testing](#testing)
  - [Unit Testing](#unit-testing)
  - [Integration Testing](#integration-testing)
- [Database](#database)
- [Serverless Backend](#serverless-backend)
- [CI/CD Pipeline with Vercel](#ci-cd-pipeline-with-vercel)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- Create, edit, and delete Kanban boards.
- Manage board members with add/remove functionality.
- Drag-and-drop interface for reordering boards.
- Responsive design for mobile and desktop devices.
- User authentication with JWT-based session management.
- Real-time user search for adding members.
- SEO-optimized metadata and social media sharing support.
- Progressive Web App (PWA) compatibility with favicon and touch icons.
- Free and ready-to-deploy project management hub.

![Login Page](/github-readme-assets/login.png)

---

## Technical Details
- **Framework**: Next.js 15 (App Router) for server-side rendering and static site generation.
- **Frontend**: React with TypeScript for type-safe components.
- **Styling**: Tailwind CSS for responsive and utility-first styling.
- **Animations**: Framer Motion for smooth transitions and animations.
- **Drag-and-Drop**: @hello-pangea/dnd for board reordering functionality.
- **Font**: Inter from next/font/google for consistent typography.
- **API**: RESTful API endpoints for board and user management, secured with JWT, hosted as Vercel Serverless Functions.
- **Database**: MongoDB for storing user and board data.
- **Metadata**: Enhanced with OpenGraph and Twitter Card for social sharing.
- **Icons**: Favicon, Apple Touch icons, and PWA manifest for cross-device compatibility.
- **State Management**: React hooks (useState, useEffect) for local state handling.
- **Routing**: Next.js useRouter for client-side navigation.
- **Authentication**: Token-based authentication stored in localStorage.
- **Background**: Gradient-based design with teal-cyan color scheme.

---

## System Requirements
- Node.js: v18 or higher
- npm: v9 or higher
- Git: For cloning the repository
- Vercel CLI: For deployment (optional, for local Vercel commands)
- MongoDB: MongoDB Atlas account or local MongoDB instance
- Browser: Modern browsers (Chrome, Firefox, Safari, Edge)

---

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/AbdulAHAD968/Mini-Trello.git
   cd Mini-Trello
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add environment variables:
   ```plaintext
   NEXT_PUBLIC_API_URL=https://boardshub.vercel.app/api
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/boardhub?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with your MongoDB Atlas credentials or local MongoDB connection string.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

![Boards Page](/github-readme-assets/boards.png)

---

## Testing
Testing ensures the reliability and functionality of BoardHub. The project uses Jest for unit and integration testing, with React Testing Library for component testing.

### Unit Testing
Unit tests focus on individual components and functions, such as state updates and utility functions.

- **Setup**:
  Install testing dependencies:
  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest
  ```
  Configure Jest in `jest.config.js`:
  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
      '\\.(css|scss)$': 'identity-obj-proxy',
    },
  };
  ```
  Create `jest.setup.ts`:
  ```typescript
  import '@testing-library/jest-dom';
  ```

- **Example Test** (for BoardsPage component):
  ```typescript
  import { render, screen } from '@testing-library/react';
  import BoardsPage from './app/BoardsPage';

  describe('BoardsPage', () => {
    it('renders loading state', () => {
      render(<BoardsPage />);
      expect(screen.getByText('Loading your boards...')).toBeInTheDocument();
    });
  });
  ```

- **Run Tests**:
  ```bash
  npm test
  ```

### Integration Testing
Integration tests verify interactions between components, API calls, and MongoDB operations, mocking the API with MSW (Mock Service Worker).

- **Setup**:
  Install MSW:
  ```bash
  npm install --save-dev msw
  ```
  Configure MSW in `src/mocks/handlers.ts`:
  ```typescript
  import { rest } from 'msw';

  export const handlers = [
    rest.get('/api/boards', (req, res, ctx) => {
      return res(ctx.json([{ _id: '1', title: 'Test Board', description: '', owner: { _id: '1', name: 'Test User', email: 'test@example.com' }, members: [], createdAt: '2025-09-29' }]));
    }),
  ];
  ```
  Initialize MSW in `src/mocks/server.ts`:
  ```typescript
  import { setupServer } from 'msw/node';
  import { handlers } from './handlers';

  export const server = setupServer(...handlers);
  ```

- **Example Integration Test**:
  ```typescript
  import { render, screen, waitFor } from '@testing-library/react';
  import BoardsPage from './app/BoardsPage';
  import { server } from '../mocks/server';

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('BoardsPage Integration', () => {
    it('fetches and displays boards', async () => {
      render(<BoardsPage />);
      await waitFor(() => {
        expect(screen.getByText('Test Board')).toBeInTheDocument();
      });
    });
  });
  ```

- **Run Tests**:
  ```bash
  npm test
  ```

---

## Database
BoardHub uses MongoDB as its database to store user and board data, leveraging MongoDB Atlas for cloud-hosted, scalable storage.

- **Setup**:
  1. Create a MongoDB Atlas account at `https://www.mongodb.com/cloud/atlas`.
  2. Set up a cluster and obtain the connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/boardhub`).
  3. Add the `MONGODB_URI` to your `.env.local` file or Vercel environment variables.
  4. Install the MongoDB Node.js driver:
     ```bash
     npm install mongodb
     ```
  5. Configure API routes to connect to MongoDB in `pages/api` (example):
     ```typescript
     import { MongoClient } from 'mongodb';

     const uri = process.env.MONGODB_URI;
     const client = new MongoClient(uri);

     export async function connectToDatabase() {
       await client.connect();
       return client.db('boardhub');
     }
     ```

- **Schema**:
  - **Users**: Stores user details ( `_id`, `name`, `email`).
  - **Boards**: Stores board details ( `_id`, `title`, `description`, `owner`, `members`, `createdAt`).
  - Data is accessed via RESTful API endpoints (e.g., `/api/boards`, `/api/users/search`).

- **Features**:
  - Scalable cloud storage with MongoDB Atlas.
  - Secure connection with SRV protocol and TLS.
  - Efficient querying for user search and board management.

![List Page](/github-readme-assets/list.png)

---

## Serverless Backend
BoardHub uses Vercel Serverless Functions to handle backend logic, providing a scalable and maintenance-free API layer.

- **Implementation**:
  - API routes are defined in `pages/api` (e.g., `/api/boards`, `/api/users/search`).
  - Each route is a serverless function that connects to MongoDB for data operations.
  - Example API route (`pages/api/boards/index.ts`):
    ```typescript
    import type { NextApiRequest, NextApiResponse } from 'next';
    import { connectToDatabase } from '../../../lib/mongodb';

    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
      const db = await connectToDatabase();
      if (req.method === 'GET') {
        const boards = await db.collection('boards').find().toArray();
        res.status(200).json(boards);
      }
      // Handle POST, PUT, DELETE similarly
    }
    ```

- **Benefits**:
  - Automatic scaling with Vercel Serverless Functions.
  - No server management required.
  - Seamless integration with Next.js and MongoDB.
  - Secure JWT-based authentication for API endpoints.

- **Environment Variables**:
  - `MONGODB_URI`: MongoDB connection string.
  - `NEXT_PUBLIC_API_URL`: Base URL for API requests (e.g., `https://boardshub.vercel.app/api`).

---

## CI/CD Pipeline with Vercel
BoardHub is deployed on Vercel with an automated CI/CD pipeline integrated with the GitHub repository, making it a free and ready-to-deploy solution.

- **Setup**:
  1. Connect the GitHub repository (`https://github.com/AbdulAHAD968/Mini-Trello`) to Vercel:
     - Log in to Vercel and import the repository.
     - Configure the project with the framework preset as Next.js.
     - Add environment variables in Vercel dashboard:
       - `NEXT_PUBLIC_API_URL=https://boardshub.vercel.app/api`
       - `MONGODB_URI=<your-mongodb-connection-string>`
  2. Vercel automatically detects the Next.js project and configures build settings:
     - Build Command: `next build`
     - Output Directory: `.next`
     - Install Command: `npm install`
  3. Vercel triggers a build and deployment on every push or pull request to the `main` branch.

- **Pipeline Workflow**:
  - **Continuous Integration**:
    - Vercel runs `npm install` and `npm run build` on each commit.
    - If tests are added, include a test script in `package.json`:
      ```json
      "scripts": {
        "test": "jest"
      }
      ```
      Update Vercel build settings to run `npm test` before building.
  - **Continuous Deployment**:
    - Successful builds are deployed to `https://boardshub.vercel.app/`.
    - Pull requests create preview deployments with unique URLs (e.g., `https://mini-trello-git-branch-name-abdulahad968.vercel.app`).
    - Rollbacks are supported via Vercel’s deployment history.

---

## Deployment
The application is live at `https://boardshub.vercel.app/`. As a free project management hub, BoardHub is ready to deploy with minimal setup. To deploy updates:
1. Push changes to the `main` branch of the GitHub repository:
   ```bash
   git add .
   git commit -m "Update features"
   git push origin main
   ```
2. Vercel automatically builds and deploys the changes.
3. Monitor the deployment status in the Vercel dashboard.

To deploy locally using Vercel CLI:
```bash
vercel
vercel --prod
```

---

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request to the `main` branch.

Ensure code follows TypeScript and ESLint standards. Run `npm run lint` before committing.

---

## License
MIT License. See [LICENSE](LICENSE) for details.
