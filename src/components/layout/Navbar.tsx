import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, BookOpen, User, LogIn, LayoutDashboard, Moon, Sun, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              Dynamic Tech <span className="gradient-text">Academy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="hero" size="sm">
                      <ShieldCheck className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to={isAdmin ? '/admin' : '/dashboard'}>
                  <Button variant="outline" size="sm">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t my-2" />
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" className="w-full justify-start">
                        <ShieldCheck className="w-4 h-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <LogIn className="w-4 h-4" />
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="hero" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
