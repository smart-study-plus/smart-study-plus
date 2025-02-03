# Smart Study+ FE Repo

## Project Overview
This is a frontend application built using React and Vite. It provides a modern, responsive user interface for the Smart Study+ learning platform.

## Project Structure
```plaintext
fe2/
├── index.html                # Entry HTML file
├── package.json             # Project dependencies and scripts
├── README.md               # Project documentation
├── src/                    # Source code directory
│   ├── App.css            # Global styles
│   ├── App.jsx            # Root component
│   ├── assets/            # Static assets (images, fonts, etc.)
│   ├── components/        # Reusable components
│   │   ├── auth/         # Authentication components
│   │   │   ├── LoginModal.jsx
│   │   │   └── SignupModal.jsx
│   │   └── layout/       # Layout components
│   │       ├── Footer.jsx
│   │       ├── Header.jsx
│   │       ├── MainLayout.jsx
│   │       └── SidebarLayout.jsx
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx  # Dashboard page
│   │   ├── Home.jsx      # Landing page
│   │   ├── NotFound.jsx  # 404 page
│   │   ├── Practice.jsx  # Practice mode page
│   │   ├── TestMode.jsx  # Test listing page
│   │   └── TestQuestion.jsx # Individual test page
│   ├── routes/           # Routing configuration
│   │   └── index.jsx
│   ├── services/         # API services
│   │   └── authService.js
│   └── utils/            # Utility functions
│       └── validators.js
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite configuration
```

## Getting Started

### Prerequisites
Ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- Git

### Progress
- These routes have been somewhat developed and mapped out
```javascript
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/practice',
    element: <Practice />,
  },
  {
    path: '/test-mode',
    element: <TestMode />,
  },
  {
    path: '/test/:testId',
    element: <TestQuestion />,
  },
```
- Though Login and Register Modal has been developed but I haven't fetched it to the API - which has worked.

### Setup Instructions

#### 1. Clone the Repository
```bash
git clone https://github.com/smart-study-plus/smart-study-plus.git
cd smart-study-plus
```

#### 2. Pull the Latest Main Branch
```bash
git pull origin main
```

#### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

#### 4. Install Dependencies
```bash
npm install
# or
yarn
```
#### 5. Run the Application
Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at: [http://localhost:5173](http://localhost:5173)

### Development Guidelines

#### Component Structure
- Use functional components with hooks
- Follow the container/presentational pattern
- Keep components small and focused
- Use TypeScript for type safety

#### Styling
- Use Tailwind CSS for styling
- Follow the project's color scheme:
  - Primary: #F4976C
  - Secondary: #303C6C
  - Background: #B4DFE5

#### State Management [Pending]
- Use React hooks for local state
- Consider Redux or Context for global state
- Keep state as close to where it's used as possible

### Testing
Run the test suite:
```bash
npm run test
# or
yarn test
```

### Building for Production
Create a production build:
```bash
npm run build
# or
yarn build
```

### Creating a Pull Request
1. Commit your changes:
```bash
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name
```

2. Open a pull request on GitHub
3. Wait for review and approval

## Review Process
1. Code must follow project style guidelines
2. All tests must pass
3. At least one team member must approve

## Deployment: Vercel [Pending]
1. Merging to main triggers automatic deployment
2. Staging deployment on PR creation
3. Production deployment on main branch updates

## Additional Resources
- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
