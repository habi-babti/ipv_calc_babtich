import { useState, useEffect } from 'react';
import './Calculator.css';

function SubnettingQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [quizStarted, setQuizStarted] = useState(false);

  const generateQuestion = (difficulty) => {
    const difficulties = {
      easy: {
        prefixes: [24, 25, 26, 27, 28],
        baseNetworks: ['192.168.1.0', '10.0.0.0', '172.16.0.0']
      },
      medium: {
        prefixes: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
        baseNetworks: ['192.168.0.0', '10.0.0.0', '172.16.0.0', '203.0.113.0']
      },
      hard: {
        prefixes: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        baseNetworks: ['10.0.0.0', '172.16.0.0', '192.168.0.0', '203.0.113.0', '198.51.100.0']
      }
    };

    const config = difficulties[difficulty];
    const prefix = config.prefixes[Math.floor(Math.random() * config.prefixes.length)];
    const baseNetwork = config.baseNetworks[Math.floor(Math.random() * config.baseNetworks.length)];
    
    const questionTypes = [
      'networkAddress',
      'broadcastAddress', 
      'subnetMask',
      'usableHosts',
      'firstHost',
      'lastHost'
    ];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    // Calculate correct answers
    const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const ipParts = baseNetwork.split('.').map(p => parseInt(p));
    const ipNumber = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const networkAddress = (ipNumber & mask) >>> 0;
    const broadcastAddress = (networkAddress + Math.pow(2, 32 - prefix) - 1) >>> 0;
    
    const numberToIp = (num) => [
      (num >>> 24) & 255,
      (num >>> 16) & 255, 
      (num >>> 8) & 255,
      num & 255
    ].join('.');
    
    const answers = {
      networkAddress: numberToIp(networkAddress),
      broadcastAddress: numberToIp(broadcastAddress),
      subnetMask: numberToIp(mask),
      usableHosts: Math.pow(2, 32 - prefix) - 2,
      firstHost: numberToIp(networkAddress + 1),
      lastHost: numberToIp(broadcastAddress - 1)
    };
    
    const questionTexts = {
      networkAddress: 'Quelle est l\'adresse réseau ?',
      broadcastAddress: 'Quelle est l\'adresse de broadcast ?',
      subnetMask: 'Quel est le masque de sous-réseau ?',
      usableHosts: 'Combien d\'hôtes utilisables ?',
      firstHost: 'Quelle est la première adresse hôte ?',
      lastHost: 'Quelle est la dernière adresse hôte ?'
    };
    
    return {
      network: `${baseNetwork}/${prefix}`,
      question: questionTexts[questionType],
      answer: answers[questionType].toString(),
      type: questionType,
      allAnswers: answers
    };
  };

  const startQuiz = () => {
    const newQuestions = Array.from({ length: 10 }, () => generateQuestion(difficulty));
    setQuestions(newQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setQuizStarted(true);
    setQuizComplete(false);
    setShowResult(false);
    setUserAnswer('');
  };

  const submitAnswer = () => {
    const correct = userAnswer.trim().toLowerCase() === questions[currentQuestion].answer.toLowerCase();
    
    if (correct) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizComplete(false);
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswer('');
    setShowResult(false);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent ! Vous maîtrisez parfaitement le sous-réseautage !';
    if (percentage >= 80) return 'Très bien ! Vous avez une bonne compréhension du sous-réseautage.';
    if (percentage >= 70) return 'Bien ! Continuez à pratiquer pour améliorer vos compétences.';
    if (percentage >= 60) return 'Pas mal ! Il y a encore quelques concepts à réviser.';
    return 'Continuez à étudier ! Le sous-réseautage demande de la pratique.';
  };

  if (!quizStarted) {
    return (
      <div className="calculator">
        <div className="calculator-header">
          <h1>Quiz de Sous-réseautage</h1>
          <p>Testez vos connaissances en sous-réseautage IPv4 avec des questions interactives</p>
        </div>

        <div className="quiz-setup">
          <div className="difficulty-selection">
            <h3>Choisissez votre niveau</h3>
            <div className="difficulty-options">
              <label className={`difficulty-option ${difficulty === 'easy' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="easy"
                  checked={difficulty === 'easy'}
                  onChange={(e) => setDifficulty(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">
                    <span className="difficulty-indicator easy"></span>
                    Facile
                  </span>
                  <span className="option-desc">Préfixes /24 à /28</span>
                </div>
              </label>
              
              <label className={`difficulty-option ${difficulty === 'medium' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="medium"
                  checked={difficulty === 'medium'}
                  onChange={(e) => setDifficulty(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">
                    <span className="difficulty-indicator medium"></span>
                    Moyen
                  </span>
                  <span className="option-desc">Préfixes /20 à /29</span>
                </div>
              </label>
              
              <label className={`difficulty-option ${difficulty === 'hard' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="hard"
                  checked={difficulty === 'hard'}
                  onChange={(e) => setDifficulty(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-title">
                    <span className="difficulty-indicator hard"></span>
                    Difficile
                  </span>
                  <span className="option-desc">Préfixes /16 à /30</span>
                </div>
              </label>
            </div>
          </div>

          <div className="quiz-info">
            <h3><span className="card-header-icon info-icon"></span>Format du quiz</h3>
            <ul>
              <li>10 questions aléatoires</li>
              <li>Questions sur les adresses réseau, broadcast, masques, etc.</li>
              <li>Réponses instantanées avec explications</li>
              <li>Score final avec recommandations</li>
            </ul>
          </div>

          <button onClick={startQuiz} className="calculate-button">
            <span className="button-icon start-icon"></span>
            Commencer le Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="calculator">
        <div className="quiz-complete">
          <h1><span className="celebration-icon"></span>Quiz Terminé !</h1>
          
          <div className="final-score">
            <div className={`score-display ${getScoreColor(percentage)}`}>
              <span className="score-number">{score}/{questions.length}</span>
              <span className="score-percentage">({percentage}%)</span>
            </div>
            <p className="score-message">{getScoreMessage(percentage)}</p>
          </div>

          <div className="quiz-summary">
            <h3><span className="card-header-icon summary-icon"></span>Résumé des réponses</h3>
            <div className="questions-review">
              {questions.map((q, index) => (
                <div key={index} className="question-review">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className="question-network">{q.network}</span>
                  </div>
                  <div className="question-text">{q.question}</div>
                  <div className="correct-answer">
                    <strong>Réponse:</strong> {q.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="quiz-actions">
            <button onClick={startQuiz} className="calculate-button">
              <span className="button-icon refresh-icon"></span>
              Refaire le Quiz
            </button>
            <button onClick={resetQuiz} className="secondary-button">
              <span className="button-icon settings-icon"></span>
              Changer de Niveau
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = showResult && userAnswer.trim().toLowerCase() === question.answer.toLowerCase();

  return (
    <div className="calculator">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span>Question {currentQuestion + 1} sur {questions.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="quiz-score">Score: {score}/{currentQuestion + (showResult ? 1 : 0)}</div>
      </div>

      <div className="question-section">
        <div className="network-display">
          <h2>Réseau: {question.network}</h2>
        </div>
        
        <div className="question-text">
          <h3>{question.question}</h3>
        </div>

        {!showResult ? (
          <div className="answer-input">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Entrez votre réponse..."
              onKeyPress={(e) => e.key === 'Enter' && userAnswer.trim() && submitAnswer()}
            />
            <button 
              onClick={submitAnswer}
              className="calculate-button"
              disabled={!userAnswer.trim()}
            >
              Valider
            </button>
          </div>
        ) : (
          <div className="answer-result">
            <div className={`result-display ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className={`result-icon ${isCorrect ? 'success-icon' : 'error-icon'}`}></div>
              <div className="result-text">
                {isCorrect ? 'Correct !' : 'Incorrect'}
              </div>
            </div>
            
            <div className="answer-explanation">
              <div className="correct-answer">
                <strong>Réponse correcte:</strong> {question.answer}
              </div>
              {!isCorrect && (
                <div className="user-answer">
                  <strong>Votre réponse:</strong> {userAnswer}
                </div>
              )}
            </div>

            <div className="detailed-answers">
              <h4><span className="card-header-icon details-icon"></span>Détails complets pour {question.network}:</h4>
              <div className="answers-grid">
                <div className="answer-item">
                  <span>Adresse réseau:</span>
                  <span>{question.allAnswers.networkAddress}</span>
                </div>
                <div className="answer-item">
                  <span>Première adresse hôte:</span>
                  <span>{question.allAnswers.firstHost}</span>
                </div>
                <div className="answer-item">
                  <span>Dernière adresse hôte:</span>
                  <span>{question.allAnswers.lastHost}</span>
                </div>
                <div className="answer-item">
                  <span>Adresse de broadcast:</span>
                  <span>{question.allAnswers.broadcastAddress}</span>
                </div>
                <div className="answer-item">
                  <span>Masque de sous-réseau:</span>
                  <span>{question.allAnswers.subnetMask}</span>
                </div>
                <div className="answer-item">
                  <span>Hôtes utilisables:</span>
                  <span>{question.allAnswers.usableHosts}</span>
                </div>
              </div>
            </div>

            <button onClick={nextQuestion} className="calculate-button">
              {currentQuestion < questions.length - 1 ? 'Question Suivante' : 'Voir les Résultats'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubnettingQuiz;