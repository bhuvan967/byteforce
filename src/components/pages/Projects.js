import React, { useEffect, useState } from "react";

export default function Projects() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All', 'Easy', 'Medium', 'Hard'

  useEffect(() => {
    // Load completed questions from localStorage
    const completed = JSON.parse(localStorage.getItem('completedQuestions') || '[]');
    setCompletedQuestions(completed);
    
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/questions.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load questions.json: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setQuestions(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load questions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const difficultyBadge = (d) => {
    const base = "px-2 py-0.5 text-xs font-semibold rounded-full";
    if (d === 'Easy') return `${base} bg-green-100 text-green-700 border border-green-200`;
    if (d === 'Medium') return `${base} bg-yellow-100 text-yellow-700 border border-yellow-200`;
    if (d === 'Hard') return `${base} bg-red-100 text-red-700 border border-red-200`;
    return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
  };

  // Calculate stats
  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'Easy').length,
    medium: questions.filter(q => q.difficulty === 'Medium').length,
    hard: questions.filter(q => q.difficulty === 'Hard').length,
    completedTotal: completedQuestions.length,
    completedEasy: questions.filter(q => q.difficulty === 'Easy' && completedQuestions.includes(q.id)).length,
    completedMedium: questions.filter(q => q.difficulty === 'Medium' && completedQuestions.includes(q.id)).length,
    completedHard: questions.filter(q => q.difficulty === 'Hard' && completedQuestions.includes(q.id)).length,
  };

  // Filter questions
  const filteredQuestions = filter === 'All' 
    ? questions 
    : questions.filter(q => q.difficulty === filter);

  return (
    <div className="min-h-screen bg-white text-black p-6 flex items-start justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="text-gray-600 hover:text-black text-sm font-semibold mb-3 flex items-center gap-1 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-black">Projects</h1>
          <p className="text-gray-600 mt-1">Browse coding projects pulled from the shared question bank.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Solved</div>
            <div className="text-3xl font-bold text-black">{stats.completedTotal}/{stats.total}</div>
          </div>
          <div className="bg-white border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-green-700 font-semibold mb-1">Easy</div>
            <div className="text-3xl font-bold text-green-700">{stats.completedEasy}/{stats.easy}</div>
          </div>
          <div className="bg-white border border-yellow-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-yellow-700 font-semibold mb-1">Medium</div>
            <div className="text-3xl font-bold text-yellow-700">{stats.completedMedium}/{stats.medium}</div>
          </div>
          <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-red-700 font-semibold mb-1">Hard</div>
            <div className="text-3xl font-bold text-red-700">{stats.completedHard}/{stats.hard}</div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
          {['All', 'Easy', 'Medium', 'Hard'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                filter === level
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-black'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="font-bold text-lg">All Projects</div>
            <div className="text-sm text-gray-600">Showing: {filteredQuestions.length}</div>
          </div>

          {loading ? (
            <div className="p-6 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-6 text-gray-600">No projects found for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-600 w-16">#</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-600">Title</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-600 w-40">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q, idx) => {
                    const isCompleted = completedQuestions.includes(q.id);
                    return (
                      <tr
                        key={q.id || idx}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/projects/${q.id}`}
                      >
                        <td className="px-4 py-3 font-semibold text-gray-800">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{q.title || q.id || `Project ${idx + 1}`}</div>
                            {isCompleted && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{q.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={difficultyBadge(q.difficulty)}>{q.difficulty || 'N/A'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:border-black transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
