import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, Calendar, Ban, CheckCircle, Edit, Trash2, X, UserPlus, Loader, AlertCircle, Users as UsersIcon, GraduationCap, BookOpen, Shield } from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function ListUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // State for different user types
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [admins, setAdmins] = useState([]);
  
  const [loadingStates, setLoadingStates] = useState({
    professors: true,
    students: true,
    guests: true,
    admins: true
  });

  // Fetch all user data
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all user types concurrently
        const [professorsData, studentsData, guestsData, adminsData] = await Promise.allSettled([
          adminService.getProfessors(),
          adminService.getStudents(),
          adminService.getGuests(),
          adminService.getAdmins()
        ]);

        // Process professors (no email in current structure, construct name from firstName + lastName)
        if (professorsData.status === 'fulfilled') {
          setProfessors(professorsData.value.map(prof => ({
            id: prof.user_id, // Fixed: was prof.userId
            name: prof.first_name && prof.last_name ? `${prof.first_name} ${prof.last_name}` : prof.first_name || prof.last_name || 'N/A', // Fixed: snake_case
            email: 'N/A', // Professor entity doesn't have email field
            role: 'Professeur',
            status: 'active', // Default status
            joinDate: new Date().toISOString().split('T')[0], // No createdAt in professor entity
            phone: '+216 00 000 000'
          })));
        } else {
          console.error('Error fetching professors:', professorsData.reason);
        }

        // Process students (has user relationship with email, construct name from firstName + lastName)
        if (studentsData.status === 'fulfilled') {
          setStudents(studentsData.value.map(student => ({
            id: student.userId, // Fixed: StudentDto returns userId
            name: student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : student.firstName || student.lastName || 'N/A',
            email: student.email || 'N/A', // Fixed: Now StudentDto includes email
            role: 'Étudiant',
            status: 'active', // Default status if not provided
            joinDate: new Date().toISOString().split('T')[0], // No createdAt in StudentDto
            phone: '+216 00 000 000'
          })));
        } else {
          console.error('Error fetching students:', studentsData.reason);
        }

        // Process guests (has direct email, use pseudo as name fallback)
        if (guestsData.status === 'fulfilled') {
          setGuests(guestsData.value.map(guest => ({
            id: guest.id,
            name: guest.pseudo || 'N/A',
            email: guest.email || 'N/A',
            role: 'Invité',
            status: 'active', // Default status for guests
            joinDate: guest.createdAt ? new Date(guest.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            phone: '+216 00 000 000'
          })));
        } else {
          console.error('Error fetching guests:', guestsData.reason);
        }

        // Process admins (no email in current structure, construct name from firstName + lastName)
        if (adminsData.status === 'fulfilled') {
          setAdmins(adminsData.value.map(admin => ({
            id: admin.user_id, // Fixed: was admin.userId
            name: admin.first_name && admin.last_name ? `${admin.first_name} ${admin.last_name}` : admin.first_name || admin.last_name || 'N/A', // Fixed: snake_case
            email: 'N/A', // Admin entity doesn't have direct email field
            role: 'Administrateur',
            status: 'active', // Default status for admins
            joinDate: new Date().toISOString().split('T')[0], // No createdAt in admin entity
            phone: '+216 00 000 000'
          })));
        } else {
          console.error('Error fetching admins:', adminsData.reason);
        }

      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
        setLoadingStates({
          professors: false,
          students: false,
          guests: false,
          admins: false
        });
      }
    };

    fetchAllUsers();
  }, []);

  // Get current users based on active tab
  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'professors':
        return professors;
      case 'students':
        return students;
      case 'guests':
        return guests;
      case 'admins':
        return admins;
      default:
        return [...professors, ...students, ...guests, ...admins];
    }
  };

  // Get filtered users based on search and filter
  const allUsers = getCurrentUsers();
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const totalUsers = professors.length + students.length + guests.length + admins.length;
  const totalStudents = students.length;
  const totalProfessors = professors.length;
  const totalBlocked = [...professors, ...students, ...guests, ...admins].filter(u => u.status === 'blocked').length;

  // État pour le formulaire d'ajout
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Étudiant',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Gestionnaire pour l'ajout d'utilisateur
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Convert phone to proper format
      const formattedPhone = newUser.phone.startsWith('+216') ? newUser.phone : `+216 ${newUser.phone}`;
      
      // For now, we'll add to local state since there's no specific API endpoint for adding users
      // In a real implementation, you would call an adminService.createUser() method here
      const userToAdd = {
        id: Date.now(), // Temporary ID generation
        ...newUser,
        phone: formattedPhone
      };
      
      // Determine which user type array to update based on role
      if (newUser.role === 'Professeur') {
        setProfessors([...professors, {
          id: userToAdd.id,
          name: userToAdd.name,
          email: userToAdd.email,
          role: userToAdd.role,
          status: userToAdd.status,
          joinDate: userToAdd.joinDate,
          phone: userToAdd.phone
        }]);
      } else if (newUser.role === 'Étudiant') {
        setStudents([...students, {
          id: userToAdd.id,
          name: userToAdd.name,
          email: userToAdd.email,
          role: userToAdd.role,
          status: userToAdd.status,
          joinDate: userToAdd.joinDate,
          phone: userToAdd.phone
        }]);
      }
      
      setShowAddForm(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'Étudiant',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      });
      
      console.log('User added locally (API endpoint needed):', userToAdd);
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Erreur lors de l\'ajout de l\'utilisateur');
    }
  };

  // Gestionnaire pour la modification d'utilisateur
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Convert phone to proper format
      const formattedPhone = editingUser.phone.startsWith('+216') ? editingUser.phone : `+216 ${editingUser.phone}`;
      const formattedUser = {
        ...editingUser,
        phone: formattedPhone
      };
      
      // Update the appropriate user array based on role
      if (editingUser.role === 'Professeur') {
        setProfessors(professors.map(prof =>
          prof.id === editingUser.id ? { ...formattedUser } : prof
        ));
      } else if (editingUser.role === 'Étudiant') {
        setStudents(students.map(student =>
          student.id === editingUser.id ? { ...formattedUser } : student
        ));
      } else if (editingUser.role === 'Invité') {
        setGuests(guests.map(guest =>
          guest.id === editingUser.id ? { ...formattedUser } : guest
        ));
      } else if (editingUser.role === 'Administrateur') {
        setAdmins(admins.map(admin =>
          admin.id === editingUser.id ? { ...formattedUser } : admin
        ));
      }
      
      setEditingUser(null);
      console.log('User updated locally (API endpoint needed):', formattedUser);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Erreur lors de la modification de l\'utilisateur');
    }
  };

  // Mise à jour des champs du formulaire d'ajout
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mise à jour des champs du formulaire de modification
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour ouvrir le modal de modification
  const openEditModal = (user) => {
    setEditingUser({...user});
  };

  // Fonction pour basculer le statut d'un utilisateur
  const toggleUserStatus = async (userId) => {
    try {
      setError(null);
      
      // Find which array contains the user and toggle status
      const updatedProfessors = professors.map(prof =>
        prof.id === userId
          ? { ...prof, status: prof.status === 'active' ? 'blocked' : 'active' }
          : prof
      );
      
      const updatedStudents = students.map(student =>
        student.id === userId
          ? { ...student, status: student.status === 'active' ? 'blocked' : 'active' }
          : student
      );
      
      const updatedGuests = guests.map(guest =>
        guest.id === userId
          ? { ...guest, status: guest.status === 'active' ? 'blocked' : 'active' }
          : guest
      );
      
      const updatedAdmins = admins.map(admin =>
        admin.id === userId
          ? { ...admin, status: admin.status === 'active' ? 'blocked' : 'active' }
          : admin
      );
      
      // Check if any array was updated (meaning we found the user)
      const wasUpdated = updatedProfessors.some((prof, i) => prof.id === userId && prof.status !== professors[i]?.status) ||
                        updatedStudents.some((student, i) => student.id === userId && student.status !== students[i]?.status) ||
                        updatedGuests.some((guest, i) => guest.id === userId && guest.status !== guests[i]?.status) ||
                        updatedAdmins.some((admin, i) => admin.id === userId && admin.status !== admins[i]?.status);
      
      if (wasUpdated) {
        setProfessors(updatedProfessors);
        setStudents(updatedStudents);
        setGuests(updatedGuests);
        setAdmins(updatedAdmins);
        console.log('User status toggled locally (API endpoint needed):', userId);
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError('Erreur lors du changement de statut');
    }
  };

  // Fonction pour supprimer un utilisateur
  const deleteUser = async (userId) => {
    try {
      setError(null);
      
      // Remove user from the appropriate array
      setProfessors(professors.filter(prof => prof.id !== userId));
      setStudents(students.filter(student => student.id !== userId));
      setGuests(guests.filter(guest => guest.id !== userId));
      setAdmins(admins.filter(admin => admin.id !== userId));
      
      console.log('User deleted locally (API endpoint needed):', userId);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#624BFF] shadow-sm border-b border-[#5240e6]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h1>
              <p className="text-gray-100 text-sm mt-1">Gérer et surveiller tous les utilisateurs de la plateforme</p>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-white text-[#624BFF] font-medium rounded-lg hover:bg-gray-100 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Ajouter Utilisateur
            </button>
          </div>
        </div>
      </header>

      {/* Modal d'ajout d'utilisateur */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Nouvel Utilisateur</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom et prénom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">
                    +216
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="20 123 456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Étudiant">Étudiant</option>
                    <option value="Professeur">Professeur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut *
                  </label>
                  <select
                    name="status"
                    value={newUser.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Actif</option>
                    <option value="blocked">Bloqué</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'inscription *
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={newUser.joinDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter l'Utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification d'utilisateur */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Modifier l'Utilisateur</h2>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingUser.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom et prénom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">
                    +216
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={editingUser.phone.replace('+216 ', '')}
                    onChange={handleEditInputChange}
                    required
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="20 123 456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <select
                    name="role"
                    value={editingUser.role}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Étudiant">Étudiant</option>
                    <option value="Professeur">Professeur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut *
                  </label>
                  <select
                    name="status"
                    value={editingUser.status}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Actif</option>
                    <option value="blocked">Bloqué</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'inscription *
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={editingUser.joinDate}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier l'Utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Chargement des utilisateurs...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'all', label: 'Tous', icon: UsersIcon, count: totalUsers },
                    { key: 'professors', label: 'Professeurs', icon: BookOpen, count: totalProfessors },
                    { key: 'students', label: 'Étudiants', icon: GraduationCap, count: totalStudents },
                    { key: 'guests', label: 'Invités', icon: UsersIcon, count: guests.length },
                    { key: 'admins', label: 'Admins', icon: Shield, count: admins.length }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          activeTab === tab.key
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Étudiants</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{totalStudents}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Professeurs</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{totalProfessors}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Bloqués</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{totalBlocked}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="all">Tous les rôles</option>
                      <option value="Étudiant">Étudiants</option>
                      <option value="Professeur">Professeurs</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date d'inscription</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user, index) => (
                      <tr key={`${user.role}-${user.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Professeur'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {user.joinDate}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status === 'active' ? 'Actif' : 'Bloqué'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifier"
                              onClick={() => openEditModal(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className={`p-2 hover:bg-red-50 rounded-lg transition-colors ${
                                user.status === 'active' ? 'text-red-600' : 'text-green-600'
                              }`}
                              onClick={() => toggleUserStatus(user.id)}
                              title={user.status === 'active' ? 'Bloquer' : 'Débloquer'}
                            >
                              {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => deleteUser(user.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}