import { useState } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, Eye, BookOpen, User, Calendar } from 'lucide-react';

export default function ListQuiz() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: 'JavaScript Fondamentaux', professor: 'Prof. Tasnim Belghith', category: 'Programmation', questions: 5, status: 'pending', createdAt: '2025-10-16', difficulty: 'Facile' },
    { id: 2, title: 'Histoire de Tunisie', professor: 'Prof. Rabeb Chtiti', category: 'Histoire', questions: 15, status: 'approved', createdAt: '2025-08-08', difficulty: 'Moyen' },
    { id: 3, title: 'Mathématiques Avancées', professor: 'Prof. Aziz Mdalal', category: 'Mathématiques', questions: 25, status: 'pending', createdAt: '2025-10-12', difficulty: 'Difficile' },
    { id: 4, title: 'Biologie Cellulaire', professor: 'Prof. Tasnim Belghith', category: 'Sciences', questions: 18, status: 'rejected', createdAt: '2025-10-05', difficulty: 'Moyen' },
    { id: 5, title: 'Anglais B2', professor: 'Prof. Rabeb Chtiti', category: 'Langues', questions: 30, status: 'approved', createdAt: '2025-10-01', difficulty: 'Facile' },
    { id: 6, title: 'Chimie Organique', professor: 'Prof. Aziz Mdalal', category: 'Sciences', questions: 22, status: 'pending', createdAt: '2025-07-13', difficulty: 'Difficile' },
    { id: 7, title: 'Physique Quantique', professor: 'Prof. Mohamed Ali', category: 'Physique', questions: 20, status: 'pending', createdAt: '2025-10-15', difficulty: 'Difficile' },
    { id: 8, title: 'Français Intermédiaire', professor: 'Prof. Sophie Martin', category: 'Langues', questions: 12, status: 'pending', createdAt: '2025-10-14', difficulty: 'Moyen' },
    { id: 9, title: 'Économie Internationale', professor: 'Prof. Ahmed Khan', category: 'Économie', questions: 16, status: 'pending', createdAt: '2025-10-13', difficulty: 'Moyen' },
    { id: 10, title: 'Algorithmes et Structures', professor: 'Prof. Laura Chen', category: 'Informatique', questions: 28, status: 'pending', createdAt: '2025-10-11', difficulty: 'Difficile' },
    { id: 11, title: 'Art Moderne', professor: 'Prof. Elena Rossi', category: 'Art', questions: 8, status: 'pending', createdAt: '2025-10-10', difficulty: 'Facile' },
    { id: 12, title: 'Géographie Mondiale', professor: 'Prof. Carlos Silva', category: 'Géographie', questions: 14, status: 'pending', createdAt: '2025-10-09', difficulty: 'Moyen' }
  ]);

  // Fonction pour approuver un quiz
  const approveQuiz = (quizId) => {
    setQuizzes(prevQuizzes => 
      prevQuizzes.map(quiz => 
        quiz.id === quizId ? { ...quiz, status: 'approved' } : quiz
      )
    );
    setSelectedQuiz(null); // Fermer la modal après action
  };

  // Fonction pour rejeter un quiz
  const rejectQuiz = (quizId) => {
    setQuizzes(prevQuizzes => 
      prevQuizzes.map(quiz => 
        quiz.id === quizId ? { ...quiz, status: 'rejected' } : quiz
      )
    );
    setSelectedQuiz(null); // Fermer la modal après action
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.professor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = quizzes.filter(q => q.status === 'pending').length;
  const approvedCount = quizzes.filter(q => q.status === 'approved').length;
  const rejectedCount = quizzes.filter(q => q.status === 'rejected').length;

  const QuizDetailModal = ({ quiz, onClose }) => {
    if (!quiz) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Professeur</p>
                <p className="font-medium text-gray-900">{quiz.professor}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                <p className="font-medium text-gray-900">{quiz.category}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Questions</p>
                <p className="font-medium text-gray-900">{quiz.questions} questions</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Difficulté</p>
                <p className="font-medium text-gray-900">{quiz.difficulty}</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">Ce quiz couvre les concepts essentiels et avancés pour tester les connaissances des étudiants. Toutes les questions ont été soigneusement élaborées pour garantir une évaluation complète.</p>
            </div>

            {quiz.status === 'pending' && (
              <div className="flex gap-3">
                <button 
                  onClick={() => approveQuiz(quiz.id)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approuver
                </button>
                <button 
                  onClick={() => rejectQuiz(quiz.id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rejeter
                </button>
              </div>
            )}

            {quiz.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Quiz approuvé</span>
                </div>
              </div>
            )}

            {quiz.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Quiz rejeté</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#624BFF] shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Validation des Quiz</h1>
              <p className="text-gray-100 text-sm mt-1">Examiner et valider les quiz créés par les professeurs</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white text-[#624BFF] px-6 py-3 rounded-lg font-medium">
                {pendingCount} en attente
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Attente</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approuvés</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejetés</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre ou professeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-2 ${
                quiz.status === 'pending' ? 'bg-orange-500' :
                quiz.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4 mr-2" />
                      {quiz.professor}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {quiz.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {quiz.category}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {quiz.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{quiz.questions} questions</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    quiz.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    quiz.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {quiz.status === 'pending' ? 'En attente' :
                     quiz.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedQuiz(quiz)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Examiner le Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <QuizDetailModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
    </div>
  );
}