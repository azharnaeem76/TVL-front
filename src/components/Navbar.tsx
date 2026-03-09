'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import NotificationBell from '@/components/NotificationBell';
import { getCurrentUser, logout } from '@/lib/api';
import { ThemeToggle } from '@/lib/theme';
import { LanguageSwitcher, useI18n } from '@/lib/i18n';

interface NavLink {
  href: string;
  label: string;
  auth?: boolean;
  roles?: string[]; // if set, only these roles see the link; if not set, visible to all
}

// Only public links shown in navbar; logged-in users use the sidebar for full navigation
const NAV_LINKS: NavLink[] = [
  { href: '/search', label: 'Search' },
  { href: '/case-laws', label: 'Case Laws' },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/';
  };

  const isActive = (href: string) => pathname === href;

  const visibleLinks = NAV_LINKS.filter(l => {
    if (l.auth && !user) return false;
    if (l.roles && user && !l.roles.includes(user.role)) return false;
    if (l.roles && !user) return false; // role-restricted links hidden for guests
    return true;
  });

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-navy-950/90 backdrop-blur-xl border-b border-brass-400/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Logo size={36} className="transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-brass-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-white tracking-tight">TVL</span>
              <span className="text-[10px] text-brass-400/70 block -mt-1 tracking-[0.15em] uppercase font-medium">The Value of Law</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? 'text-brass-300 bg-brass-400/10'
                    : 'text-gray-400 hover:text-brass-300 hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brass-400 rounded-full" />
                )}
              </Link>
            ))}

            <div className="w-px h-6 bg-brass-400/10 mx-2" />

            <LanguageSwitcher />
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <Link href="/settings" className="w-8 h-8 rounded-full bg-gradient-to-br from-brass-500 to-wood-700 flex items-center justify-center text-xs font-bold text-white shadow-glow-gold/20 hover:scale-110 transition-transform">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary !py-2 !px-5 text-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="relative w-5 h-4">
              <span className={`absolute left-0 w-5 h-0.5 bg-brass-300 rounded-full transition-all duration-300 ${menuOpen ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-1.5 w-5 h-0.5 bg-brass-300 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 w-5 h-0.5 bg-brass-300 rounded-full transition-all duration-300 ${menuOpen ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${menuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'}`}>
          <div className="pb-4 pt-2 space-y-1 border-t border-brass-400/10">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? 'text-brass-300 bg-brass-400/10'
                    : 'text-gray-400 hover:text-brass-300 hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-4 py-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <div className="divider my-2" />
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2">
                  <NotificationBell />
                  <span className="text-sm text-gray-400">Notifications</span>
                </div>
                <Link href="/settings" className="block px-4 py-2.5 text-sm text-gray-400 hover:text-brass-300 hover:bg-white/[0.04] rounded-lg">Settings</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/[0.04] rounded-lg">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="block px-4 py-2.5 text-sm text-brass-400 font-medium">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
