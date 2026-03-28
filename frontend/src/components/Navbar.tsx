import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="bg-white-800 p-4">
    <ul className="flex space-x-4">
      <li><Link to="/">Home</Link></li>
      <li><Link to="/analysis">Analysis</Link></li>
      <li><Link to="/about">About</Link></li>
    </ul>
  </nav>
);
export default Navbar;