import { RouterProvider } from 'react-router-dom';
import router from './routes';
import './App.css';

function App() {
  return (
    <div className="w-full min-h-screen">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
