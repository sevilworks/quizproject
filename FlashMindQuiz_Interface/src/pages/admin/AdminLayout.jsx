import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Bell
} from 'lucide-react';
import { authService } from '../../services/authService';
const handleLogout = () => {
  authService.logout();
};

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: LayoutDashboard, 
      label: 'Tableau de Bord',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900 bg-opacity-50'
    },
    { 
      path: '/admin/users', 
      icon: Users, 
      label: 'Utilisateurs',
      color: 'text-green-400',
      bgColor: 'bg-green-900 bg-opacity-50'
    },
    { 
      path: '/admin/quizzes', 
      icon: BookOpen, 
      label: 'Quiz',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900 bg-opacity-50'
    },
    { 
      path: '/admin/subscriptions', 
      icon: CreditCard, 
      label: 'Abonnements',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900 bg-opacity-50'
    },
    { 
      path: '/admin/reclamations', 
      icon: MessageSquare, 
      label: 'Réclamations',
      color: 'text-red-400',
      bgColor: 'bg-red-900 bg-opacity-50'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#212B36] overflow-hidden">
      {/* Sidebar Desktop */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#161C24] border-r border-gray-700 transition-all duration-300 hidden lg:flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FM</span>
              </div>
              <span className="font-bold text-xl text-white">Flash_Mind</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  active
                    ? `${item.bgColor} ${item.color} font-medium border-l-4 border-blue-500`
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <Icon className={`w-5 h-5 ${active ? item.color : 'text-gray-400'}`} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            {isSidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-gray-400">Administrateur</p>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button
            onClick={handleLogout} 
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-red-900 bg-opacity-50 text-red-400 rounded-lg hover:bg-red-800 hover:bg-opacity-50 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden transition-opacity ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <aside
          className={`fixed left-0 top-0 h-full w-64 bg-[#161C24] transform transition-transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FM</span>
              </div>
              <span className="font-bold text-xl text-white">Flash_Mind</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Mobile Menu */}
          <nav className="px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                    active
                      ? `${item.bgColor} ${item.color} font-medium border-l-4 border-blue-500`
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? item.color : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-gray-400">Administrateur</p>
              </div>
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-red-900 bg-opacity-50 text-red-400 rounded-lg hover:bg-red-800 hover:bg-opacity-50 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar Mobile */}
        <div className="lg:hidden h-16 bg-[#161C24] border-b border-gray-700 flex items-center justify-between px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <span className="font-bold text-lg text-white">Flash_Mind</span>
          </div>
          <button className="p-2 hover:bg-gray-700 rounded-lg relative">
            <Bell className="w-6 h-6 text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#212B36]">
          {children}
        </main>
      </div>
    </div>
  );
}