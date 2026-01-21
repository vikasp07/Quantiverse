import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Trophy,
  RotateCcw,
  Lock,
  Unlock,
} from "lucide-react";

// Question types
const QUESTION_TYPES = {
  MCQ: "mcq",
  MCQ_MULTIPLE: "mcq_multiple",
  ONE_WORD: "one_word",
  SHORT_ANSWER: "short_answer",
  TRUE_FALSE: "true_false",
};

function QuizTaker({ quiz, onComplete, onClose, attemptNumber = 1 }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // Convert to seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [questions, setQuestions] = useState([]);

  // Initialize and shuffle questions/options if needed
  useEffect(() => {
    let processedQuestions = [...quiz.questions];

    // Shuffle questions if enabled
    if (quiz.shuffleQuestions) {
      processedQuestions = shuffleArray(processedQuestions);
    }

    // Shuffle options if enabled
    if (quiz.shuffleOptions) {
      processedQuestions = processedQuestions.map((q) => {
        if (
          q.type === QUESTION_TYPES.MCQ ||
          q.type === QUESTION_TYPES.MCQ_MULTIPLE
        ) {
          return { ...q, options: shuffleArray([...q.options]) };
        }
        return q;
      });
    }

    setQuestions(processedQuestions);
  }, [quiz]);

  // Timer
  useEffect(() => {
    if (quiz.timeLimit <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz.timeLimit, isSubmitted]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleMCQSelect = (questionId, optionId, isMultiple) => {
    if (isMultiple) {
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter((id) => id !== optionId)
        : [...currentAnswers, optionId];
      handleAnswerChange(questionId, newAnswers);
    } else {
      handleAnswerChange(questionId, optionId);
    }
  };

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const calculateResult = useCallback(() => {
    let totalScore = 0;
    let correctCount = 0;
    const questionResults = [];

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      let earnedMarks = 0;

      switch (question.type) {
        case QUESTION_TYPES.MCQ:
        case QUESTION_TYPES.TRUE_FALSE:
          const correctOption = question.options.find((o) => o.isCorrect);
          isCorrect = userAnswer === correctOption?.id;
          break;

        case QUESTION_TYPES.MCQ_MULTIPLE:
          const correctOptions = question.options
            .filter((o) => o.isCorrect)
            .map((o) => o.id);
          const selectedOptions = userAnswer || [];
          isCorrect =
            correctOptions.length === selectedOptions.length &&
            correctOptions.every((id) => selectedOptions.includes(id));
          break;

        case QUESTION_TYPES.ONE_WORD:
          const acceptedAnswers = question.correctAnswer
            .split("|")
            .map((a) => a.trim().toLowerCase());
          isCorrect = acceptedAnswers.includes(
            (userAnswer || "").trim().toLowerCase()
          );
          break;

        case QUESTION_TYPES.SHORT_ANSWER:
          // For short answers, we check if key terms are present
          const keywords = question.correctAnswer
            .toLowerCase()
            .split(/[,\s]+/)
            .filter((k) => k.length > 2);
          const userWords = (userAnswer || "").toLowerCase().split(/[,\s]+/);
          const matchedKeywords = keywords.filter((k) =>
            userWords.some((w) => w.includes(k) || k.includes(w))
          );
          // Award partial marks based on keyword matches
          const matchRatio =
            keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;
          isCorrect = matchRatio >= 0.7; // 70% keyword match required
          earnedMarks = Math.round(question.marks * matchRatio);
          break;

        default:
          break;
      }

      if (question.type !== QUESTION_TYPES.SHORT_ANSWER) {
        earnedMarks = isCorrect ? question.marks : 0;
      }

      if (isCorrect) correctCount++;
      totalScore += earnedMarks;

      questionResults.push({
        questionId: question.id,
        question: question.question,
        type: question.type,
        userAnswer,
        correctAnswer:
          question.type === QUESTION_TYPES.MCQ ||
          question.type === QUESTION_TYPES.TRUE_FALSE
            ? question.options.find((o) => o.isCorrect)?.id
            : question.type === QUESTION_TYPES.MCQ_MULTIPLE
            ? question.options.filter((o) => o.isCorrect).map((o) => o.id)
            : question.correctAnswer,
        isCorrect,
        earnedMarks,
        maxMarks: question.marks,
        explanation: question.explanation,
      });
    });

    const percentage =
      quiz.totalMarks > 0 ? (totalScore / quiz.totalMarks) * 100 : 0;
    const passed = percentage >= quiz.passingMarks;

    return {
      totalScore,
      totalMarks: quiz.totalMarks,
      percentage: Math.round(percentage * 10) / 10,
      correctCount,
      totalQuestions: questions.length,
      passed,
      questionResults,
      attemptNumber,
      completedAt: new Date().toISOString(),
    };
  }, [answers, questions, quiz, attemptNumber]);

  const handleSubmit = (isAutoSubmit = false) => {
    if (!isAutoSubmit && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }

    const calculatedResult = calculateResult();
    setResult(calculatedResult);
    setIsSubmitted(true);
    setShowConfirmSubmit(false);

    if (onComplete) {
      onComplete(calculatedResult);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600">No questions available in this quiz.</p>
        </div>
      </div>
    );
  }

  // Result Screen
  if (isSubmitted && result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div
          className={`text-center p-8 rounded-xl mb-6 ${
            result.passed
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
              : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              result.passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {result.passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              result.passed ? "text-green-700" : "text-red-700"
            }`}
          >
            {result.passed ? "Congratulations! You Passed!" : "Quiz Not Passed"}
          </h2>
          <p className="text-gray-600 mb-4">{quiz.title}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-2xl font-bold text-gray-800">
                {result.totalScore}/{result.totalMarks}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="text-2xl font-bold text-gray-800">
                {result.percentage}%
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Correct</p>
              <p className="text-2xl font-bold text-gray-800">
                {result.correctCount}/{result.totalQuestions}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Passing</p>
              <p className="text-2xl font-bold text-gray-800">
                {quiz.passingMarks}%
              </p>
            </div>
          </div>

          {!result.passed && quiz.attemptsAllowed > attemptNumber && (
            <p className="mt-4 text-orange-600">
              You have {quiz.attemptsAllowed - attemptNumber} attempt(s)
              remaining.
            </p>
          )}
        </div>

        {/* Question-wise results */}
        {quiz.showResultsImmediately && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Detailed Results
            </h3>
            {result.questionResults.map((qr, index) => (
              <div
                key={qr.questionId}
                className={`p-4 rounded-lg border ${
                  qr.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      qr.isCorrect ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {qr.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      Q{index + 1}: {qr.question}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Marks: {qr.earnedMarks}/{qr.maxMarks}
                    </p>
                    {qr.explanation && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-sm text-gray-600">
                          <strong>Explanation:</strong> {qr.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {result.passed && quiz.requirePassToUnlockNext && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <Unlock className="w-5 h-5" />
              <span>Next task unlocked!</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">{quiz.title}</h2>
          {quiz.timeLimit > 0 && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeLeft < 60
                  ? "bg-red-100 text-red-700"
                  : timeLeft < 300
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
      </div>

      {/* Question Navigation Pills */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                idx === currentQuestionIndex
                  ? "bg-blue-500 text-white"
                  : answers[q.id]
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${flaggedQuestions.has(q.id) ? "ring-2 ring-orange-400" : ""}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
            Answered
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded" />
            Not Answered
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border-2 border-orange-400 rounded" />
            Flagged
          </span>
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="ml-2 text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {currentQuestion.marks}{" "}
                {currentQuestion.marks === 1 ? "mark" : "marks"}
              </span>
            </div>
            <button
              onClick={() => toggleFlagQuestion(currentQuestion.id)}
              className={`p-2 rounded-lg transition-colors ${
                flaggedQuestions.has(currentQuestion.id)
                  ? "bg-orange-100 text-orange-600"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>

          <p className="text-lg font-medium text-gray-800 mb-6">
            {currentQuestion.question}
          </p>

          {/* MCQ Options */}
          {(currentQuestion.type === QUESTION_TYPES.MCQ ||
            currentQuestion.type === QUESTION_TYPES.TRUE_FALSE) && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    handleMCQSelect(currentQuestion.id, option.id, false)
                  }
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    answers[currentQuestion.id] === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === option.id
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {answers[currentQuestion.id] === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-700">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* MCQ Multiple */}
          {currentQuestion.type === QUESTION_TYPES.MCQ_MULTIPLE && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">
                Select all that apply
              </p>
              {currentQuestion.options.map((option) => {
                const isSelected = (answers[currentQuestion.id] || []).includes(
                  option.id
                );
                return (
                  <button
                    key={option.id}
                    onClick={() =>
                      handleMCQSelect(currentQuestion.id, option.id, true)
                    }
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-700">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* One Word Answer */}
          {currentQuestion.type === QUESTION_TYPES.ONE_WORD && (
            <div>
              <input
                type="text"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
                placeholder="Type your answer..."
              />
            </div>
          )}

          {/* Short Answer */}
          {currentQuestion.type === QUESTION_TYPES.SHORT_ANSWER && (
            <div>
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                rows="4"
                placeholder="Type your answer..."
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={() => handleSubmit()}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Send className="w-5 h-5" />
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() =>
              setCurrentQuestionIndex((prev) =>
                Math.min(questions.length - 1, prev + 1)
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Submit Quiz?
            </h3>
            <p className="text-gray-600 mb-4">
              You have answered {answeredCount} out of {questions.length}{" "}
              questions.
              {answeredCount < questions.length && (
                <span className="text-orange-600 block mt-2">
                  Warning: {questions.length - answeredCount} question(s) are
                  unanswered!
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Review Answers
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizTaker;
