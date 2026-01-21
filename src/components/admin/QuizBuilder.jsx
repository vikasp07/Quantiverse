import React, { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  Circle,
  Type,
  ListChecks,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Question types
const QUESTION_TYPES = {
  MCQ: "mcq",
  MCQ_MULTIPLE: "mcq_multiple",
  ONE_WORD: "one_word",
  SHORT_ANSWER: "short_answer",
  TRUE_FALSE: "true_false",
};

const QuestionTypeLabels = {
  [QUESTION_TYPES.MCQ]: "Multiple Choice (Single Answer)",
  [QUESTION_TYPES.MCQ_MULTIPLE]: "Multiple Choice (Multiple Answers)",
  [QUESTION_TYPES.ONE_WORD]: "One Word Answer",
  [QUESTION_TYPES.SHORT_ANSWER]: "Short Answer",
  [QUESTION_TYPES.TRUE_FALSE]: "True / False",
};

const QuestionTypeIcons = {
  [QUESTION_TYPES.MCQ]: Circle,
  [QUESTION_TYPES.MCQ_MULTIPLE]: ListChecks,
  [QUESTION_TYPES.ONE_WORD]: Type,
  [QUESTION_TYPES.SHORT_ANSWER]: Type,
  [QUESTION_TYPES.TRUE_FALSE]: CheckCircle,
};

// Empty question template
const createEmptyQuestion = (type = QUESTION_TYPES.MCQ) => ({
  id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  question: "",
  options:
    type === QUESTION_TYPES.TRUE_FALSE
      ? [
          { id: "opt_true", text: "True", isCorrect: false },
          { id: "opt_false", text: "False", isCorrect: false },
        ]
      : type === QUESTION_TYPES.MCQ || type === QUESTION_TYPES.MCQ_MULTIPLE
      ? [
          { id: `opt_${Date.now()}_1`, text: "", isCorrect: false },
          { id: `opt_${Date.now()}_2`, text: "", isCorrect: false },
          { id: `opt_${Date.now()}_3`, text: "", isCorrect: false },
          { id: `opt_${Date.now()}_4`, text: "", isCorrect: false },
        ]
      : [],
  correctAnswer: "", // For one-word and short answer
  marks: 1,
  explanation: "",
});

// Empty quiz template
export const createEmptyQuiz = () => ({
  enabled: false,
  title: "",
  description: "",
  passingMarks: 60,
  totalMarks: 0,
  timeLimit: 0, // 0 means no limit
  attemptsAllowed: 1,
  showResultsImmediately: true,
  shuffleQuestions: false,
  shuffleOptions: false,
  requirePassToUnlockNext: true,
  questions: [],
});

function QuizBuilder({ quiz, onChange, taskIndex }) {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestionExpand = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const updateQuiz = (updates) => {
    onChange({ ...quiz, ...updates });
  };

  const addQuestion = (type = QUESTION_TYPES.MCQ) => {
    const newQuestion = createEmptyQuestion(type);
    updateQuiz({
      questions: [...quiz.questions, newQuestion],
      totalMarks: quiz.totalMarks + newQuestion.marks,
    });
    setExpandedQuestions((prev) => ({ ...prev, [newQuestion.id]: true }));
  };

  const removeQuestion = (questionId) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    updateQuiz({
      questions: quiz.questions.filter((q) => q.id !== questionId),
      totalMarks: quiz.totalMarks - (question?.marks || 0),
    });
  };

  const updateQuestion = (questionId, updates) => {
    const updatedQuestions = quiz.questions.map((q) =>
      q.id === questionId ? { ...q, ...updates } : q
    );

    // Recalculate total marks
    const totalMarks = updatedQuestions.reduce(
      (sum, q) => sum + (q.marks || 0),
      0
    );

    updateQuiz({
      questions: updatedQuestions,
      totalMarks,
    });
  };

  const addOption = (questionId) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      text: "",
      isCorrect: false,
    };

    updateQuestion(questionId, {
      options: [...question.options, newOption],
    });
  };

  const removeOption = (questionId, optionId) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question || question.options.length <= 2) return;

    updateQuestion(questionId, {
      options: question.options.filter((o) => o.id !== optionId),
    });
  };

  const updateOption = (questionId, optionId, updates) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      options: question.options.map((o) =>
        o.id === optionId ? { ...o, ...updates } : o
      ),
    });
  };

  const setCorrectOption = (questionId, optionId, isMultiple = false) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;

    let updatedOptions;
    if (isMultiple) {
      // Toggle the selected option
      updatedOptions = question.options.map((o) =>
        o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o
      );
    } else {
      // Single correct answer - deselect all others
      updatedOptions = question.options.map((o) => ({
        ...o,
        isCorrect: o.id === optionId,
      }));
    }

    updateQuestion(questionId, { options: updatedOptions });
  };

  const renderQuestionEditor = (question) => {
    const isExpanded = expandedQuestions[question.id];
    const Icon = QuestionTypeIcons[question.type] || HelpCircle;

    return (
      <div
        key={question.id}
        className="border border-gray-200 rounded-lg bg-white shadow-sm mb-4"
      >
        {/* Question Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleQuestionExpand(question.id)}
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-gray-400" />
            <Icon className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">
              {question.question || "New Question"}
            </span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {QuestionTypeLabels[question.type]}
            </span>
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {question.marks} {question.marks === 1 ? "mark" : "marks"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeQuestion(question.id);
              }}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Question Editor Body */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Text *
              </label>
              <textarea
                value={question.question}
                onChange={(e) =>
                  updateQuestion(question.id, { question: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Enter your question here..."
              />
            </div>

            {/* Marks */}
            <div className="flex gap-4">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={question.marks}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      marks: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Options for MCQ types */}
            {(question.type === QUESTION_TYPES.MCQ ||
              question.type === QUESTION_TYPES.MCQ_MULTIPLE ||
              question.type === QUESTION_TYPES.TRUE_FALSE) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options{" "}
                  {question.type === QUESTION_TYPES.MCQ_MULTIPLE &&
                    "(Select all correct answers)"}
                </label>
                <div className="space-y-2">
                  {question.options.map((option, idx) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCorrectOption(
                            question.id,
                            option.id,
                            question.type === QUESTION_TYPES.MCQ_MULTIPLE
                          )
                        }
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          option.isCorrect
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {option.isCorrect && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) =>
                          updateOption(question.id, option.id, {
                            text: e.target.value,
                          })
                        }
                        disabled={question.type === QUESTION_TYPES.TRUE_FALSE}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder={`Option ${idx + 1}`}
                      />
                      {question.type !== QUESTION_TYPES.TRUE_FALSE &&
                        question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(question.id, option.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
                {question.type !== QUESTION_TYPES.TRUE_FALSE && (
                  <button
                    type="button"
                    onClick={() => addOption(question.id)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Option
                  </button>
                )}
              </div>
            )}

            {/* Correct Answer for text-based questions */}
            {(question.type === QUESTION_TYPES.ONE_WORD ||
              question.type === QUESTION_TYPES.SHORT_ANSWER) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer *
                  {question.type === QUESTION_TYPES.ONE_WORD && (
                    <span className="text-gray-500 font-normal ml-1">
                      (Case insensitive, separate alternatives with |)
                    </span>
                  )}
                </label>
                {question.type === QUESTION_TYPES.ONE_WORD ? (
                  <input
                    type="text"
                    value={question.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        correctAnswer: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., react | React | ReactJS"
                  />
                ) : (
                  <textarea
                    value={question.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        correctAnswer: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Enter the expected answer (keywords for auto-grading)"
                  />
                )}
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Explanation (shown after answering)
              </label>
              <textarea
                value={question.explanation}
                onChange={(e) =>
                  updateQuestion(question.id, { explanation: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Explain why this is the correct answer..."
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-300 rounded-xl bg-gray-50 p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-500" />
          Task Quiz
        </h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={quiz.enabled}
            onChange={(e) => updateQuiz({ enabled: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Enable Quiz</span>
        </label>
      </div>

      {quiz.enabled && (
        <div className="space-y-6">
          {/* Quiz Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => updateQuiz({ title: e.target.value })}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Task 1 Assessment"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Description
              </label>
              <input
                type="text"
                value={quiz.description}
                onChange={(e) => updateQuiz({ description: e.target.value })}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the quiz"
              />
            </div>
          </div>

          {/* Quiz Configuration */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Quiz Settings
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Passing Marks (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quiz.passingMarks}
                  onChange={(e) =>
                    updateQuiz({ passingMarks: parseInt(e.target.value) || 0 })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Time Limit (mins, 0=none)
                </label>
                <input
                  type="number"
                  min="0"
                  value={quiz.timeLimit}
                  onChange={(e) =>
                    updateQuiz({ timeLimit: parseInt(e.target.value) || 0 })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Attempts Allowed
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quiz.attemptsAllowed}
                  onChange={(e) =>
                    updateQuiz({
                      attemptsAllowed: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Total Marks
                </label>
                <input
                  type="text"
                  value={quiz.totalMarks}
                  disabled
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={quiz.showResultsImmediately}
                  onChange={(e) =>
                    updateQuiz({ showResultsImmediately: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                Show Results Immediately
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={quiz.shuffleQuestions}
                  onChange={(e) =>
                    updateQuiz({ shuffleQuestions: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                Shuffle Questions
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={quiz.shuffleOptions}
                  onChange={(e) =>
                    updateQuiz({ shuffleOptions: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                Shuffle Options
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={quiz.requirePassToUnlockNext}
                  onChange={(e) =>
                    updateQuiz({ requirePassToUnlockNext: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                Require Pass for Next Task
              </label>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-700">
                Questions ({quiz.questions.length})
              </h5>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addQuestion(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    + Add Question
                  </option>
                  {Object.entries(QuestionTypeLabels).map(([type, label]) => (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {quiz.questions.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No questions added yet</p>
                <p className="text-sm text-gray-400">
                  Use the dropdown above to add questions
                </p>
              </div>
            ) : (
              <div>{quiz.questions.map((q) => renderQuestionEditor(q))}</div>
            )}
          </div>

          {/* Summary */}
          {quiz.questions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="text-sm font-semibold text-blue-700 mb-2">
                Quiz Summary
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Total Questions:</span>{" "}
                  <strong>{quiz.questions.length}</strong>
                </div>
                <div>
                  <span className="text-blue-600">Total Marks:</span>{" "}
                  <strong>{quiz.totalMarks}</strong>
                </div>
                <div>
                  <span className="text-blue-600">Passing Score:</span>{" "}
                  <strong>
                    {Math.ceil((quiz.passingMarks / 100) * quiz.totalMarks)}/
                    {quiz.totalMarks}
                  </strong>
                </div>
                <div>
                  <span className="text-blue-600">Time Limit:</span>{" "}
                  <strong>
                    {quiz.timeLimit || "None"} {quiz.timeLimit ? "mins" : ""}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizBuilder;
