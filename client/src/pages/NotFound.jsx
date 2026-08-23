import { Link } from 'react-router-dom';
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full mt-20">
    <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
    <p className="text-xl mt-4 text-gray-600 dark:text-gray-400">Page Not Found</p>
    <Link to="/" className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded">Go Home</Link>
  </div>
);
export default NotFound;
