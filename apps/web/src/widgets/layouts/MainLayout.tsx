import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

export function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navLinks = [
    { path: "/", label: "홈" },
    { path: "/boards", label: "게시판" },
    { path: "/popular", label: "인기글" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold text-blue-600">
            에대숲
          </Link>

          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/my"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {user.nickname}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-400 hover:text-gray-600"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
