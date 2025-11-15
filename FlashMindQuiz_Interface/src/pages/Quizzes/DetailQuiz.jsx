import React, { useState, useEffect } from 'react';
import { Share2, QrCode, Users, Plus, Copy, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { quizService } from '../../services/quizService';

export default function QuizDetailsTemplate() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Validate quiz ID parameter
  const quizId = parseInt(id);
  if (isNaN(quizId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">ID du quiz invalide</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#624BFF] text-white rounded-lg hover:bg-[#513BDB]"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(quiz?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quiz details
        const quizData = await quizService.getQuizById(quizId);
        if (!quizData) {
          throw new Error('Quiz not found');
        }
        setQuiz(quizData);

        // Fetch questions
        if (quizData.questions) {
          setQuestions(quizData.questions.map(q => ({
            id: q.id,
            text: q.question_text || q.questionText,
            options: q.responses ? q.responses.map(r => r.response_text || r.responseText) : []
          })));
        }

        // Fetch participants
        try {
          const participations = await quizService.getQuizParticipations(quizId);
          const participantsData = participations.map(p => ({
            id: p.id,
            name: p.userId ? `Student ${p.userId}` : `Guest ${p.guestId}`,
            avatar: p.userId ? `S${p.userId}` : `G${p.guestId}`,
            score: p.score
          }));
          setParticipants(participantsData);
        } catch (err) {
          console.warn('Could not fetch participants:', err);
          setParticipants([]);
        }

      } catch (err) {
        console.error('Error fetching quiz data:', err);
        if (err.response?.status === 404) {
          setError('Quiz introuvable');
        } else if (err.response?.status === 401) {
          setError('Accès non autorisé à ce quiz');
        } else {
          setError('Échec du chargement des détails du quiz');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#624BFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails du quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Quiz non trouvé'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#624BFF] text-white rounded-lg hover:bg-[#513BDB]"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#624BFF] to-[#7C5FFF] text-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">Détails du Quiz</h1>
      </div>

      {/* Quiz Info Card */}
      <div className="w-full bg-white shadow-xl rounded-2xl p-8 my-8 mx-auto max-w-7xl border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">
          {quiz.title}
        </h2>
        <p className="text-gray-600 mb-6 text-lg">
          {quiz.description || 'Aucune description disponible.'}
        </p>

        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-gray-200 shadow-sm">
          <div>
            <p className="text-sm text-gray-500 mb-2 font-medium">Code du Quiz</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-[#212B36] to-[#212B36] bg-clip-text text-transparent">{quiz.code}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-[#624BFF] hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
            </button>
            <button className="p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-[#624BFF] hover:bg-gray-50 transition-all duration-200 shadow-sm">
              <QrCode className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-[#624BFF] to-[#7C5FFF] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 font-medium">
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-[#624BFF] to-[#7C5FFF] rounded-full"></div>
              Questions du Quiz
            </h3>
            <div className="space-y-8">
              {questions.map((question) => (
                <div key={question.id} className="border-b border-gray-100 last:border-0 pb-8 last:pb-0 hover:bg-gray-50 rounded-xl p-4 transition-colors duration-200">
                  <p className="text-gray-800 font-semibold mb-4 text-lg">{question.id}. {question.text}</p>
                  {question.options.length > 0 && (
                    <ul className="ml-4 space-y-3 list-none text-gray-700">
                      {question.options.map((option, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{idx + 1}</span>
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
                <button className="px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-[#624BFF] to-[#7C5FFF] text-white hover:shadow-lg hover:scale-105 hover:brightness-110 transition-all duration-200">
              Voir tous les questions
              </button>
          </div>
  </div>

         
        </div>

        {/* Participants */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-[#624BFF] to-[#7C5FFF] rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-xl">Participants ({participants.length})</h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {participants.length > 0 ? participants.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-md">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#624BFF] to-[#7C5FFF] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {p.avatar}
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-700 font-semibold text-sm block">{p.name}</span>
                    {p.score != null && (
                      <span className="text-xs text-gray-500">Score: {p.score}%</span>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">Aucun participant pour le moment</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}