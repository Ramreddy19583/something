"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  Bookmark,
  Kanban,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  ExternalLink,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user) {
          fetchNotifications();
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, authRequired: true },
    { href: "/saved", label: "Saved", icon: Bookmark, authRequired: true },
    { href: "/tracker", label: "Tracker", icon: Kanban, authRequired: true },
    { href: "/skills", label: "Skill Gap", icon: BookOpen, authRequired: true },
    { href: "/ai-assistant", label: "AI Advisor", icon: Sparkles },
  ];

  if (user?.role === "ADMIN") {
    navLinks.push({ href: "/admin", label: "Admin", icon: ShieldCheck, authRequired: true });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-none">
                Opportunity AI
              </span>
              <span className="text-[10px] font-medium text-emerald-600 tracking-wide mt-0.5 hidden xs:inline">
                Verified Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown (Responsive Width) */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-lg text-xs transition-colors ${
                              n.isRead ? "bg-slate-50 text-slate-600" : "bg-indigo-50/60 text-slate-900 font-medium"
                            }`}
                          >
                            <p className="font-semibold">{n.title}</p>
                            <p className="mt-0.5 text-slate-600">{n.message}</p>
                            <span className="mt-1 block text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Link (Desktop) */}
              <Link
                href="/profile"
                className="hidden md:flex items-center gap-2 pl-2 text-sm text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-xs max-w-[100px] truncate">{user.name}</span>
              </Link>

              {/* Logout (Desktop) */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-indigo-600 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger (Touch target > 44px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl mb-3 border border-indigo-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 text-indigo-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user && (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-4.5 w-4.5 text-indigo-600" />
                  <span>My Profile & Settings</span>
                </Link>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
