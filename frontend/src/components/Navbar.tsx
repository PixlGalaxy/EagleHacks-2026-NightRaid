import { Link, useLocation } from "react-router-dom";
import { Landmark, BarChart2, Home, Info } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/analysis", label: "Analysis", Icon: BarChart2 },
  { to: "/about", label: "About", Icon: Info },
];

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition">
          <Landmark size={20} className="text-orange-500" />
          <span><span className="text-slate-900">Night</span><span className="text-orange-500">Raid</span></span>
        </Link>

        {/* Links */}
        <ul className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, Icon }) => {
            const isActive = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;