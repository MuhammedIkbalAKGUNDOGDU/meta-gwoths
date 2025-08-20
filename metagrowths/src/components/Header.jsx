import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Function to get link classes based on active state
  const getLinkClasses = (path, isMobile = false) => {
    const baseClasses = isMobile
      ? "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
      : "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300";

    if (isActive(path)) {
      return `${baseClasses} text-blue-600 bg-blue-50 font-semibold`;
    }
    return `${baseClasses} text-slate-700 hover:text-blue-600`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="cursor-pointer">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent hover:from-blue-700 hover:to-slate-800 transition-all duration-300">
                  MetaGrowths
                </h1>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className={getLinkClasses("/")}>
                Ana Sayfa
              </Link>
              <Link to="/hizmetler" className={getLinkClasses("/hizmetler")}>
                Hizmetler
              </Link>
              <Link to="/hakkimizda" className={getLinkClasses("/hakkimizda")}>
                Hakkımızda
              </Link>
              <Link to="/iletisim" className={getLinkClasses("/iletisim")}>
                İletişim
              </Link>
              <a
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Giriş Yap
              </a>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/90 backdrop-blur-md border-t border-slate-200">
            <Link to="/" className={getLinkClasses("/", true)}>
              Ana Sayfa
            </Link>
            <Link
              to="/hizmetler"
              className={getLinkClasses("/hizmetler", true)}
            >
              Hizmetler
            </Link>
            <Link
              to="/hakkimizda"
              className={getLinkClasses("/hakkimizda", true)}
            >
              Hakkımızda
            </Link>
            <Link to="/iletisim" className={getLinkClasses("/iletisim", true)}>
              İletişim
            </Link>
            <a
              href="/login"
              className="bg-gradient-to-r from-blue-600 to-slate-700 text-white block px-3 py-2 rounded-md text-base font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Giriş Yap
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
