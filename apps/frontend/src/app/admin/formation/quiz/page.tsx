'use client';

import { useState, useEffect } from 'react';

const mockQuizzes = [
  { id: 'q1', title: 'Soins aux Psittacidés', course: 'Formation Soigneurs Niveau 1', questions: 10, timeLimit: 20, passingScore: 70, status: 'AVAILABLE', attempts: 3, bestScore: null, description: 'Évaluez vos connaissances sur les soins aux perroquets et perruches.' },
  { id: 'q2', title: 'Réglementation CITES', course: 'Conformité Réglementaire', questions: 15, timeLimit: 30, passingScore: 80, status: 'AVAILABLE', attempts: 2, bestScore: 85, description: 'Test sur la convention CITES et les espèces protégées de Guyane.' },
  { id: 'q3', title: 'Premiers Secours Animaux', course: 'Formation Soigneurs Niveau 2', questions: 12, timeLimit: 25, passingScore: 75, status: 'LOCKED', attempts: 1, bestScore: null, description: 'Protocoles d\'urgence et premiers secours pour animaux exotiques.' },
];

const mockQuestions = [
  {
    id: 1,
    text: 'Quelle est la fréquence de nourrissage recommandée pour un Ara adulte en captivité ?',
    options: ['1 fois par jour', '2 fois par jour', '3 fois par jour', 'En libre service'],
    correct: 1,
    explanation: 'Les Aras adultes doivent être nourris 2 fois par jour (matin et soir) avec un mélange de fruits frais, légumes et granulés premium.',
    points: 10,
  },
  {
    id: 2,
    text: 'Parmi ces fruits, lesquels sont TOXIQUES pour les perroquets ? (plusieurs réponses possibles)',
    options: ['Mangue', 'Avocat', 'Papaye', 'Raisin en grande quantité'],
    correct: 1,
    explanation: 'L\'avocat est hautement toxique pour les perroquets (contient de la persine). Le raisin en grande quantité peut causer des problèmes rénaux.',
    points: 15,
  },
  {
    id: 3,
    text: 'La température idéale pour maintenir un perroquet tropical en bonne santé est :',
    options: ['15-18°C', '20-25°C', '28-32°C', '35-40°C'],
    correct: 1,
    explanation: 'Les perroquets tropicaux sont à l\'aise entre 20 et 25°C. En dessous de 18°C, ils peuvent développer des infections respiratoires.',
    points: 10,
  },
];

type QuizState = 'LIST' | 'INTRO' | 'QUIZ' | 'RESULT';

export default function QuizPage() {
  const [state, setState] = useState<QuizState>('LIST');
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [certificates, setCertificates] = useState([
    { id: 'c1', course: 'Réglementation CITES', date: '2026-02-15', score: 85, number: 'LFTG-2026-0042' },
  ]);

  useEffect(() => {
    if (state === 'QUIZ' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [state, timeLeft]);

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(quiz.timeLimit * 60);
    setState('INTRO');
  };

  const beginQuiz = () => setState('QUIZ');

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Calculer le score
      const correct = answers.filter((a, i) => a === mockQuestions[i]?.correct).length;
      const finalScore = Math.round((correct / mockQuestions.length) * 100);
      setScore(finalScore);
      setState('RESULT');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;
  const q = mockQuestions[currentQuestion];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Liste des quiz */}
      {state === 'LIST' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🎓 Quiz & Évaluations</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Testez vos connaissances et obtenez vos certificats</p>
            </div>
          </div>

          {/* Certificats obtenus */}
          {certificates.length > 0 && (
            <div className="bg-gradient-to-r from-gold-50 to-yellow-50 dark:from-gold-900/20 dark:to-yellow-900/20 rounded-xl p-5 border border-gold-200 dark:border-gold-700">
              <h2 className="font-semibold text-gold-800 dark:text-gold-400 mb-3">🏆 Mes certificats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certificates.map(cert => (
                  <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{cert.course}</div>
                      <div className="text-xs text-gray-400">N° {cert.number} · {cert.date} · Score : {cert.score}%</div>
                    </div>
                    <button className="px-3 py-1.5 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-lg text-xs font-medium hover:bg-gold-200 transition-colors">
                      📄 PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des quiz */}
          <div className="grid gap-4">
            {mockQuizzes.map(quiz => (
              <div key={quiz.id} className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border ${quiz.status === 'LOCKED' ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-gray-100 dark:border-gray-700 hover:shadow-md'} transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                      {quiz.bestScore && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${quiz.bestScore >= quiz.passingScore ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {quiz.bestScore >= quiz.passingScore ? '✅' : '❌'} {quiz.bestScore}%
                        </span>
                      )}
                      {quiz.status === 'LOCKED' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">🔒 Verrouillé</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{quiz.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>📚 {quiz.course}</span>
                      <span>❓ {quiz.questions} questions</span>
                      <span>⏱️ {quiz.timeLimit} min</span>
                      <span>🎯 Seuil : {quiz.passingScore}%</span>
                      <span>🔄 {quiz.attempts} tentative(s)</span>
                    </div>
                  </div>
                  {quiz.status !== 'LOCKED' && (
                    <button
                      onClick={() => startQuiz(quiz)}
                      className="ml-4 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors"
                    >
                      {quiz.bestScore ? 'Repasser' : 'Commencer'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Intro quiz */}
      {state === 'INTRO' && selectedQuiz && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedQuiz.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{selectedQuiz.description}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Questions', value: selectedQuiz.questions, icon: '❓' },
                { label: 'Durée', value: `${selectedQuiz.timeLimit} min`, icon: '⏱️' },
                { label: 'Seuil', value: `${selectedQuiz.passingScore}%`, icon: '🎯' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="font-bold text-gray-900 dark:text-white">{item.value}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setState('LIST')} className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={beginQuiz} className="flex-1 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 transition-colors">
                Commencer le quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz en cours */}
      {state === 'QUIZ' && q && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header quiz */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Question {currentQuestion + 1}/{mockQuestions.length}
            </div>
            <div className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-forest-600'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-forest-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start space-x-3 mb-6">
              <span className="bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {currentQuestion + 1}
              </span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">{q.text}</h3>
            </div>

            <div className="space-y-3">
              {q.options.map((option, i) => {
                let cls = 'border-gray-200 dark:border-gray-600 hover:border-forest-400 hover:bg-forest-50 dark:hover:bg-forest-900/20';
                if (showExplanation) {
                  if (i === q.correct) cls = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                  else if (i === selectedAnswer && i !== q.correct) cls = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                } else if (selectedAnswer === i) {
                  cls = 'border-forest-500 bg-forest-50 dark:bg-forest-900/20';
                }
                return (
                  <button
                    key={i}
                    onClick={() => !showExplanation && setSelectedAnswer(i)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${cls}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        showExplanation && i === q.correct ? 'border-green-500 bg-green-500 text-white' :
                        showExplanation && i === selectedAnswer && i !== q.correct ? 'border-red-500 bg-red-500 text-white' :
                        selectedAnswer === i ? 'border-forest-500 bg-forest-500 text-white' :
                        'border-gray-300 dark:border-gray-500'
                      }`}>
                        {showExplanation && i === q.correct ? '✓' : showExplanation && i === selectedAnswer && i !== q.correct ? '✗' : String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 text-lg">💡</span>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{q.explanation}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            {!showExplanation ? (
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="px-6 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Valider la réponse
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 transition-colors"
              >
                {currentQuestion < mockQuestions.length - 1 ? 'Question suivante →' : 'Voir les résultats'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Résultats */}
      {state === 'RESULT' && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-6xl mb-4">{score >= 70 ? '🏆' : '📚'}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {score >= 70 ? 'Félicitations !' : 'Continuez vos efforts !'}
            </h2>
            <div className={`text-5xl font-bold mb-2 ${score >= 70 ? 'text-green-600' : 'text-red-600'}`}>{score}%</div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {score >= 70 ? 'Vous avez réussi le quiz et obtenu votre certificat.' : `Score minimum requis : 70%. Il vous manque ${70 - score} points.`}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Bonnes réponses', value: `${Math.round(score / 10)}/10`, icon: '✅' },
                { label: 'Score', value: `${score}%`, icon: '📊' },
                { label: 'Résultat', value: score >= 70 ? 'RÉUSSI' : 'ÉCHOUÉ', icon: score >= 70 ? '🎓' : '❌' },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-3 ${score >= 70 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="font-bold text-gray-900 dark:text-white">{item.value}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setState('LIST')} className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Retour aux quiz
              </button>
              {score >= 70 && (
                <button className="flex-1 py-3 bg-gold-500 text-white rounded-xl font-medium hover:bg-gold-600 transition-colors">
                  📄 Télécharger certificat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
