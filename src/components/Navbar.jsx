import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        <Link
          to="/"
          className="text-xl font-bold text-gray-900"
        >
          Library Management
        </Link>

        <div className="flex items-center gap-6">

          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900"
          >
            Dashboard
          </Link>

          <Link
            to="/books"
            className="text-gray-600 hover:text-gray-900"
          >
            Books
          </Link>

          <Link
            to="/members"
            className="text-gray-600 hover:text-gray-900"
          >
            Members
          </Link>

          <Link
            to="/issues"
            className="text-gray-600 hover:text-gray-900"
          >
            Issues
          </Link>

          {auth && (
            <span className="hidden text-sm text-gray-500 md:block">
              {auth.username}
            </span>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;