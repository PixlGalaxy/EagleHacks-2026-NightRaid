import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="bg-white shadow-md p-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <Link to="/" className="font-bold text-xl text-blue-600">
        NightRaid
      </Link>
      <ul className="flex space-x-6">
        <li className="hover:text-blue-600 transition">
          <Link to="/">Home</Link>
        </li>
        <li className="hover:text-blue-600 transition">
          <Link to="/analysis">Analysis</Link>
        </li>
        <li className="hover:text-blue-600 transition">
          <Link to="/about">About</Link>
        </li>
        <li className="hover:text-blue-600 transition">
          <Link to="/api-test">API Test</Link>
        </li>
      </ul>
    </div>
  </nav>
);
export default Navbar;