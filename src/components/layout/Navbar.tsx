"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  ExternalLink,
} from "lucide-react";

import { AuthModal } from "@/components/auth/AuthModal";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user) {
          fetchNotifications();
        }
      } else {
        setUser(null);
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
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Aligned navigation lists per requirements:
  // Guest: [Discover] [AI Advisor] [Log In] [Sign Up]
  // Logged-in: [Discover] [Application Tracker] [Skills & Resources] [AI Advisor] [Profile Dropdown]
  const guestNavLinks = [
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/ai-assistant", label: "AI Advisor", icon: Sparkles },
  ];

  const loggedInNavLinks = [
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/tracker", label: "Application Tracker", icon: Kanban },
    { href: "/skills", label: "Skills & Resources", icon: BookOpen },
    { href: "/ai-assistant", label: "AI Advisor", icon: Sparkles },
  ];

  const activeNavLinks = user ? loggedInNavLinks : guestNavLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Opportunity AI Home">
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
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {activeNavLinks.map((link) => {
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
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  aria-label={`View notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                  aria-expanded={notificationsOpen}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in-50 duration-100">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-600 hover:underline font-medium"
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

              {/* Profile Dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User account menu"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="font-medium text-xs max-w-[110px] truncate hidden sm:inline">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50 animate-in fade-in-50 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile & Settings</span>
                      </Link>
                      <Link
                        href="/saved"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <Bookmark className="h-4 w-4" />
                        <span>Saved Opportunities</span>
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile hamburger (Touch target > 44px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {user ? (
            <div className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl mb-3 border border-indigo-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-1">
            {activeNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                    isActive ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 text-indigo-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium min-h-[44px] text-slate-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium min-h-[44px] text-slate-700 hover:bg-slate-100"
                >
                  <Bookmark className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Saved Opportunities</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium min-h-[44px] text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-4.5 w-4.5 text-indigo-600" />
                  <span>My Profile & Settings</span>
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium min-h-[44px] text-slate-700 hover:bg-slate-100"
                  >
                    <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Admin Control Panel</span>
                  </Link>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium min-h-[44px] text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white min-h-[44px]"
                >
                  Sign In with Email
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In with Email"
        description="Enter your email to receive a secure 6-digit verification code. Restores your saved items and application tracker instantly."
        callbackUrl={pathname || "/dashboard"}
      />
    </header>
  );
}
