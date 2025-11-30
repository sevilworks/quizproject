import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { useNotification } from '../../components/Notification';

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Notification hook
  const { showSuccess, showError, showWarning, NotificationComponent } = useNotification();
  const [error, setError] = useState(null);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    duration: '30min',
    status: 'brouillon'
  });

  // Duration presets matching AddQuiz
  const durationPresets = [
    { value: '15min', label: '15 minutes' },
    { value: '30min', label: '30 minutes' },
    { value: '45min', label: '45 minutes' },
    { value: '60min', label: '60 minutes' }
  ];

  // Status options
  const statusOptions = [
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'ARCHIVED', label: 'Archivé' }
  ];
  
  const [questions, setQuestions] = useState([]);

  const quizId = parseInt(id);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const quiz = await quizService.getQuizById(quizId);
        
        // Convert backend status to frontend format
        let frontendStatus = 'brouillon';
        if (quiz.status === 'ACTIVE') frontendStatus = 'actif';
        else if (quiz.status === 'DRAFT') frontendStatus = 'brouillon';
        else if (quiz.status === 'ARCHIVED') frontendStatus = 'archive';
        
        // Convert duration to preset format
        let durationPreset = '30min';
        if (quiz.duration === 15) durationPreset = '15min';
        else if (quiz.duration === 30) durationPreset = '30min';
        else if (quiz.duration === 45) durationPreset = '45min';
        else if (quiz.duration === 60) durationPreset = '60min';

        setQuizData({
          title: quiz.title || '',
          description: quiz.description || '',
          duration: durationPreset,
          status: frontendStatus
        });

        if (quiz.questions) {
          setQuestions(quiz.questions.map(q => ({
            id: q.id,
            questionText: q.question_text || q.questionText || '',
            responses: q.responses ? q.responses.map(r => ({
              id: r.id,
              responseText: r.responseText || r.responseText || '',
              isCorrect: r.is_correct || r.isCorrect || false
            })) : []
          })));
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Erreur lors du chargement du quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const handleQuizDataChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex] = { ...updated[questionIndex], [field]: value };
      return updated;
    });
  };

  const handleResponseChange = (questionIndex, responseIndex, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      const responses = [...updated[questionIndex].responses];
      responses[responseIndex] = { ...responses[responseIndex], [field]: value };
      updated[questionIndex] = { ...updated[questionIndex], responses };
      return updated;
    });
  };

  const addResponse = (questionIndex) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex].responses.push({
        responseText: '',
        isCorrect: false
      });
      return updated;
    });
  };

  const removeResponse = (questionIndex, responseIndex) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex].responses = updated[questionIndex].responses.filter((_, idx) => idx !== responseIndex);
      return updated;
    });
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      questionText: '',
      responses: [{ responseText: '', isCorrect: false }]
    }]);
  };

  const removeQuestion = (questionIndex) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== questionIndex));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert frontend format to backend format
      let backendDuration = parseInt(quizData.duration.replace('min', ''));
      
      let backendStatus = 'DRAFT';
      if (quizData.status === 'actif') backendStatus = 'ACTIVE';
      else if (quizData.status === 'brouillon') backendStatus = 'DRAFT';
      else if (quizData.status === 'archive') backendStatus = 'ARCHIVED';

      // Step 1: Update quiz basic info
      await quizService.updateQuiz(quizId, {
        title: quizData.title,
        description: quizData.description,
        duration: backendDuration,
        status: backendStatus
      });

      // Step 2: Process questions and responses
      for (const question of questions) {
        if (question.id) {
          // Existing question - update it
          try {
            // Only update if question text is not empty
            if (question.questionText && question.questionText.trim()) {
              await quizService.updateQuestion(question.id, {
                questionText: question.questionText
              });
            }
            
            // Process responses for this existing question
            if (question.responses && question.responses.length > 0) {
              for (const response of question.responses) {
                if (response.id) {
                  // Existing response - update it
                  await quizService.updateResponse(response.id, {
                    responseText: response.responseText,
                    isCorrect: response.isCorrect || false
                  });
                } else if (response.responseText && response.responseText.trim()) {
                  // New response - add it
                  await quizService.addResponse(question.id, {
                    responseText: response.responseText,
                    isCorrect: response.isCorrect || false
                  });
                }
              }
            }
          } catch (err) {
            console.error('Error updating question:', err);
          }
        } else {
          // New question - add it
          try {
            const createdQuestion = await quizService.addQuestion(quizId, {
              questionText: question.questionText
            });
            
            // Add responses for this new question
            if (question.responses && question.responses.length > 0) {
              for (const response of question.responses) {
                if (response.responseText && response.responseText.trim()) {
                  await quizService.addResponse(createdQuestion.id, {
                    responseText: response.responseText,
                    isCorrect: response.isCorrect || false
                  });
                }
              }
            }
          } catch (err) {
            console.error('Error adding question:', err);
          }
        }
      }
      
      showSuccess('Quiz mis à jour avec succès!', 'Sauvegarde réussie');
      setTimeout(() => {
        navigate('/professor/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error saving quiz:', err);
      showError('Erreur lors de la sauvegarde du quiz: ' + (err.response?.data?.error || err.message), 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#624BFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/professor/dashboard')}
            className="px-4 py-2 bg-[#624BFF] text-white rounded-lg hover:bg-[#513BDB]"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NotificationComponent />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#624BFF] to-[#7C5FFF] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/professor/dashboard')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">Modifier le Quiz</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#624BFF] rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quiz Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations du Quiz</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre du Quiz *
              </label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => handleQuizDataChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-transparent"
                placeholder="Ex: Quiz de Mathématiques"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Statut *
              </label>
              <select
                value={quizData.status}
                onChange={(e) => handleQuizDataChange('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-[#624BFF] outline-none bg-white transition-all duration-200"
              >
                <option value="actif">Actif</option>
                <option value="brouillon">Brouillon</option>
                <option value="archive">Archivé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Durée *
              </label>
              <select
                value={quizData.duration}
                onChange={(e) => handleQuizDataChange('duration', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-[#624BFF] outline-none bg-white transition-all duration-200"
              >
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="45min">45 minutes</option>
                <option value="60min">60 minutes</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={quizData.description}
              onChange={(e) => handleQuizDataChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-transparent"
              rows="3"
              placeholder="Description du quiz..."
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Questions</h2>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-[#624BFF] text-white rounded-xl hover:bg-[#513BDB] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter une question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Question {qIndex + 1}</h3>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Texte de la question *
                  </label>
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-transparent"
                    placeholder="Entrez votre question"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Réponses
                    </label>
                    <button
                      onClick={() => addResponse(qIndex)}
                      className="text-sm text-[#624BFF] hover:underline"
                    >
                      + Ajouter une réponse
                    </button>
                  </div>

                  {question.responses.map((response, rIndex) => (
                    <div key={rIndex} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={response.isCorrect}
                        onChange={(e) => handleResponseChange(qIndex, rIndex, 'isCorrect', e.target.checked)}
                        className="w-5 h-5 text-[#624BFF] rounded focus:ring-[#624BFF]"
                      />
                      <input
                        type="text"
                        value={response.responseText}
                        onChange={(e) => handleResponseChange(qIndex, rIndex, 'responseText', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#624BFF] focus:border-transparent"
                        placeholder={`Réponse ${rIndex + 1}`}
                      />
                      <button
                        onClick={() => removeResponse(qIndex, rIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">Aucune question ajoutée</p>
                <button
                  onClick={addQuestion}
                  className="px-6 py-3 bg-[#624BFF] text-white rounded-xl hover:bg-[#513BDB] transition-colors"
                >
                  Ajouter la première question
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button at Bottom */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate('/professor/dashboard')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#624BFF] text-white rounded-xl hover:bg-[#513BDB] transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}