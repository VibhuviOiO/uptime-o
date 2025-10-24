import React, { useEffect } from "react";
import {
  Settings,
  Database,
  Building2,
  Home,
  Server,
  Network,
  Container,
  AppWindow,
  Blocks,
  Menu,
  ChevronLeft,
  ChevronRight,
  Activity,
  Globe,
  Zap,
} from "lucide-react";
import clsx from "clsx";

const menuGroups = [
  {
    title: "Monitoring",
    items: [
      { name: "Overview", icon: Activity, href: "/monitoring" },
      { name: "HTTP(S)", icon: Globe, href: "/monitors/http" },
      { name: "TCP", icon: Network, href: "/monitors/tcp" },
      { name: "PING", icon: Zap, href: "/monitors/ping" },
      { name: "DNS", icon: Database, href: "/monitors/dns" },
    ],
  },
];

interface SidebarProps {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}

export default function Sidebar({ expanded, setExpanded }: SidebarProps) {
  // Keyboard shortcut to toggle sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setExpanded(!expanded);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [expanded, setExpanded]);

  return (
    <>
      {/* Sidebar */}
      <div
        className={clsx(
          "fixed top-0 left-0 z-30 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
          expanded ? "w-70" : "w-18"
        )}
      >
      {/* Header with Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {expanded ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center">
              <img src="/inframirror.png" alt="InfraMirror" className="h-7 w-7 object-contain" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              RRStatus
            </span>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <div className="h-8 w-8 flex items-center justify-center">
              <img src="/inframirror.png" alt="InfraMirror" className="h-6 w-6 object-contain" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-8">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {expanded && (
                <h3 className="px-2 mb-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <div className={clsx(
                "space-y-2",
                !expanded && groupIndex > 0 && "border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
              )}>
                {group.items.map((item) => {
                  const selected = window.location.pathname === item.href;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                        expanded ? "justify-start" : "justify-center",
                        selected
                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800/50"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      )}
                      title={!expanded ? item.name : undefined}
                    >
                      <div className={clsx(
                        "flex items-center justify-center",
                        expanded ? "w-5 h-5" : "w-6 h-6"
                      )}>
                        <item.icon
                          className={clsx(
                            "shrink-0 transition-colors",
                            expanded ? "h-5 w-5" : "h-5 w-5",
                            selected
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                          )}
                        />
                      </div>
                      {expanded && <span className="truncate ml-1">{item.name}</span>}
                      {selected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
      </div>

      {/* Floating Toggle Button - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={clsx(
          "fixed top-4 z-40 p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out",
          "text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800",
          "hover:scale-110 active:scale-95",
          expanded ? "left-[16.5rem]" : "left-14"
        )}
        title={expanded ? "Collapse sidebar (Ctrl/Cmd + B)" : "Expand sidebar (Ctrl/Cmd + B)"}
      >
        {expanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    </>
  );
}
