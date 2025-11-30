import React, { useState } from 'react';
import { Trash2, Plus, Check, Clock, Hash } from 'lucide-react';
import { quizService } from '../../services/quizService';
import { useNotification } from '../../components/Notification';

export default function AddQuizTemplate() {
  const [quizName, setQuizName] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [status, setStatus] = useState('actif');
  const [duration, setDuration] = useState('30min');
  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['', '', '', ''], correctOption: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification hook
  const { showSuccess, showError, showWarning, NotificationComponent } = useNotification();

  const addQuestion = () => {
    setQuestions([...questions, { id: questions.length + 1, text: '', options: ['', '', '', ''], correctOption: 0 }]);
  };

  const removeQuestion = (id) => setQuestions(questions.filter(q => q.id !== id));
  const updateQuestionText = (id, text) => setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  const updateOption = (questionId, optionIndex, value) => setQuestions(questions.map(q => q.id === questionId ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) } : q));
  const setCorrectOption = (questionId, optionIndex) => setQuestions(questions.map(q => q.id === questionId ? { ...q, correctOption: optionIndex } : q));
  const removeOption = (questionId, optionIndex) => setQuestions(questions.map(q => q.id === questionId ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) } : q));
  const addOption = (questionId) => setQuestions(questions.map(q => q.id === questionId ? { ...q, options: [...q.options, ''] } : q));

  const handleSubmitQuiz = async () => {
    if (!quizName.trim()) {
      showError('Le nom du quiz est requis', 'Nom requis');
      return;
    }

    if (questions.length === 0 || questions.some(q => !q.text.trim())) {
      showError('Toutes les questions doivent avoir un texte', 'Questions incomplètes');
      return;
    }

    if (questions.some(q => q.options.filter(opt => opt.trim()).length < 2)) {
      showError('Chaque question doit avoir au moins 2 options', 'Options insuffisantes');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert frontend status to backend status
      let backendStatus = 'DRAFT';
      if (status === 'actif') backendStatus = 'ACTIVE';
      else if (status === 'brouillon') backendStatus = 'DRAFT';
      else if (status === 'archive') backendStatus = 'ARCHIVED';

      // Create quiz object
      const quizData = {
        title: quizName,
        description: quizDescription,
        duration: parseInt(duration.replace('min', '')),
        status: backendStatus
      };

      // Create quiz first
      const createdQuiz = await quizService.createQuiz(quizData);

      // Add questions and responses
      for (const question of questions) {
        if (question.text.trim()) {
          const questionData = {
            questionText: question.text
          };
          const createdQuestion = await quizService.addQuestion(createdQuiz.id, questionData);

          // Add responses
           for (let i = 0; i < question.options.length; i++) {
             if (question.options[i].trim()) {
               const responseData = {
                 responseText: question.options[i],
                 isCorrect: i === question.correctOption
               };
               await quizService.addResponse(createdQuestion.id, responseData);
             }
           }
        }
      }

      showSuccess('Quiz créé avec succès!', 'Création réussie');
      // Reset form or redirect
      setTimeout(() => {
        setQuizName('');
        setQuizDescription('');
        setQuestions([{ id: 1, text: '', options: ['', '', '', ''], correctOption: 0 }]);
      }, 1500);

    } catch (error) {
      console.error('Erreur lors de la création du quiz:', error);
      showError('Erreur lors de la création du quiz: ' + (error.response?.data?.error || error.message), 'Erreur de création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NotificationComponent />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#624BFF] to-[#7C5FFF] text-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">Ajouter un Quiz</h1>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Paramètres du Quiz */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#624BFF] to-[#7C5FFF] rounded-full"></div>
            Paramètres du Quiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Nom du Quiz</label>
              <input
                type="text"
                placeholder="Entrez le nom du quiz"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-[#624BFF] outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-[#624BFF] outline-none bg-white transition-all duration-200"
              >
                <option value="actif">Actif</option>
                <option value="brouillon">Brouillon</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Description du Quiz</label>
              <textarea
                placeholder="Entrez la description du quiz"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-[#624BFF] outline-none resize-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Durée</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-[#624BFF] outline-none bg-white transition-all duration-200"
              >
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="45min">45 minutes</option>
                <option value="60min">60 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Infos du Quiz et Questions côte à côte */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Questions du Quiz */}
          <div className="lg:w-2/3 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-[#624BFF] to-[#7C5FFF] rounded-full"></div>
              Questions du Quiz
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {questions.map((question, qIndex) => (
                <div key={question.id} className="border-2 border-gray-200 rounded-2xl p-3 hover:border-[#624BFF] transition-all duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <label className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#624BFF] to-[#7C5FFF] flex items-center justify-center text-white text-sm font-bold">{qIndex + 1}</span>
                      Question {qIndex + 1}
                    </label>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(question.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-all duration-200">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Entrez le texte de la question"
                    value={question.text}
                    onChange={(e) => updateQuestionText(question.id, e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-[#624BFF] outline-none mb-3 transition-all duration-200"
                  />

                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <button
                          onClick={() => setCorrectOption(question.id, optIndex)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            question.correctOption === optIndex
                              ? 'bg-gradient-to-br from-[#624BFF] to-[#7C5FFF] border-[#624BFF]'
                              : 'border-gray-300 hover:border-[#624BFF]'
                          }`}
                        >
                          {question.correctOption === optIndex && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <input
                          type="text"
                          placeholder="Entrez le texte de l'option"
                          value={option}
                          onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#624BFF] focus:border-[#624BFF] outline-none transition-all duration-200"
                        />
                        {question.options.length > 2 && (
                          <button onClick={() => removeOption(question.id, optIndex)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all duration-200">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Boutons Ajouter Option + Ajouter Question */}
                    <div className="flex justify-center gap-4 pt-6 mt-6 border-t">
                      <button
                        onClick={() => addOption(question.id)}
                        className="px-6 py-2 rounded-xl font-semibold border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                      >
                        Ajouter une option
                      </button>

                      <button
                        onClick={addQuestion}
                        className="px-5 py-1.5 rounded-xl font-semibold bg-gradient-to-r from-[#624BFF] to-[#7C5FFF] text-white hover:scale-105 hover:shadow-lg hover:brightness-110 transition-all duration-200"
                      >
                        Ajouter une autre question
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infos du Quiz */}
          <div className="lg:w-1/3 bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-[#624BFF] to-[#7C5FFF] rounded-full"></div>
              Infos du Quiz
            </h3>

            <div className="flex flex-col gap-3">
              {/* ID */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 flex items-center gap-1 font-medium">
                  <Hash className="w-4 h-4 text-[#624BFF]" /> ID
                </span>
                <span className="text-sm font-bold text-gray-800">#123456</span>
              </div>

              {/* Durée */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 flex items-center gap-1 font-medium">
                  <Clock className="w-4 h-4 text-[#624BFF]" /> Durée
                </span>
                <span className="text-sm font-bold text-gray-800">{duration}</span>
              </div>

              {/* Statut */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Statut</span>
                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full capitalize">{status}</span>
              </div>

              {/* Nombre Questions */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Questions</span>
                <span className="text-sm font-bold px-2 py-1 bg-gradient-to-br from-[#624BFF] to-[#7C5FFF] text-white rounded-full">
                  {questions.length}
                </span>
              </div>
            </div>

            {/* Boutons Sous le Cadre */}
            <div className="flex justify-center gap-4 pt-6 mt-6 border-t">
              <button className="px-6 py-2 rounded-xl font-semibold border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
                Annuler
              </button>

              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-[#624BFF] to-[#7C5FFF] text-white hover:shadow-lg hover:scale-105 hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Création en cours...' : 'Ajouter le quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
