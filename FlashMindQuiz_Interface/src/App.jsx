import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Error404 from './pages/Error404';

// Pages étudiant
import StudentDashboard from './pages/StudentDashboard';
import QuizPage from './pages/Quiz';
import Results from './pages/Results';

// Pages professeur
import ProfLayout from './pages/ProfLayout';
import DashboardProf from './pages/DashboardProf';
import AbonnementProf from './pages/abonnement/abonnement';
import Paiement from './pages/abonnement/paiement';
import QuizReport from "./pages/Quizzes/QuizReport";
import DetailQuiz from "./pages/Quizzes/DetailQuiz";
import AddQuiz from "./pages/Quizzes/AddQuiz";

// Pages Admin 
import AdminLayout from './pages/admin/AdminLayout'; // À créer
import DashboardAdmin from './pages/admin/DashboardAdmin';
import ListUsers from './pages/admin/Users/ListUsers';
import ListQuiz from './pages/admin/Quizzes/ListQuiz';
import ListAbonnement from './pages/admin/Abonnements/ListAbonnement';
import ListReclamation from './pages/admin/Reclamations/ListReclamation';

// Composants
import ProtectedRoute from './components/ProtectedRoute';
import EmailVerified from './pages/EmailVerified';
import ResetPassword from './pages/ResetPassword';
import StudentStats from './pages/StudentStats';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route
          path="/reset-password"
          element={

              <ResetPassword />
          }
        />
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Routes protégées - Étudiant */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
                <Route path="/student/stats" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentStats />
          </ProtectedRoute>
        } />
        
        <Route path="/student/quiz/:id" element={
          <ProtectedRoute allowedRoles={['student']}>
            <QuizPage />
          </ProtectedRoute>
        } />
        
        <Route path="/student/results" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Results />
          </ProtectedRoute>
        } />

        {/* Layout professeur avec routes imbriquées */}
        <Route path="/professor/*" element={
          <ProtectedRoute allowedRoles={['professor_free', 'professor_vip']}>
            <ProfLayout>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardProf />} />
                <Route path="abonnement" element={<AbonnementProf />} />
                <Route path="paiement" element={<Paiement />} />
                <Route path="quiz/add" element={<AddQuiz />} />
                <Route path="quiz/:id/report" element={<QuizReport />} />
                <Route path="quiz/:id/details" element={<DetailQuiz />} />
              </Routes>
            </ProfLayout>
          </ProtectedRoute>
        } />

        {/* Layout admin avec routes imbriquées */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardAdmin />} />
                <Route path="users" element={<ListUsers />} />
                <Route path="quizzes" element={<ListQuiz />} />
                <Route path="subscriptions" element={<ListAbonnement />} />
                <Route path="reclamations" element={<ListReclamation />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Route 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;