import React, { useState } from "react";
import { Target, Briefcase, Brain, Rocket, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Ques2() {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const options = [
    {
      id: "problem-solving",
      title: "🎯 To get better at problem-solving",
      subtitle: "Sharpen your logic and algorithmic thinking.",
      message:
        "Problem-solving builds your core strength 💪. Start practicing DSA, puzzles, and logic-based challenges daily — consistency is your secret weapon!",
    },
    {
      id: "placements",
      title: "💼 To prepare for placements or jobs",
      subtitle: "Focusing on coding interviews and skill-building.",
      message:
        "You're on a mission! 🚀 Focus on mastering DSA, projects, and mock interviews. Stay consistent — your dream job is within reach!",
    },
    {
      id: "learning-tech",
      title: "🧠 To learn new technologies",
      subtitle: "Exploring tools, frameworks, and innovation.",
      message:
        "Curiosity is your power ⚙️! Learn trending tech like React, AI, or DevOps — explore, experiment, and keep building to stay ahead!",
    },
    {
      id: "projects",
      title: "🚀 To build cool projects and startups",
      subtitle: "Turning your ideas into real-world impact.",
      message:
        "Creators build the future 🌟! Start small, collaborate, and don’t fear failure — every project teaches something new!",
    },
  ];

  const cardColor = "from-indigo-500 to-blue-500"; // same gradient style

  return (
    <div className="relative min-h-screen bg-[#050A1A] flex items-center justify-center overflow-hidden text-white font-sans">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2018/03/01/14/54/artificial-intelligence-3191437_1280.jpg')] bg-cover bg-center opacity-15"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#050A1A]/95 via-[#0b1228]/85 to-[#050A1A]/95"></div>

      {/* Floating Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-60 h-60 bg-indigo-500 rounded-full blur-3xl opacity-20 top-10 left-20 animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-20 bottom-10 right-20 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-[90%] max-w-5xl p-4 md:p-6 text-center scale-95">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <div className="flex justify-center mb-4">
            <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 via-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            What’s Your Main Goal with Coding Right Now?
          </h1>
          <p className="text-blue-200 text-base mt-2">
            Select your goal and continue your journey ✨
          </p>
        </motion.div>

        {/* Options or Response */}
        <AnimatePresence mode="wait">
          {!selectedGoal ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  onClick={() => {
                    // Immediately redirect to ques3 after choosing an option, preserving uid if present
                    const params = new URLSearchParams(window.location.search);
                    const uid = params.get('uid');
                    window.location.href = `/ques3${uid ? `?uid=${uid}` : ''}`;
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative group rounded-2xl p-6 md:p-8 text-left shadow-lg transition-all duration-500 border border-white/10 bg-gradient-to-br ${cardColor} hover:shadow-blue-400/40 group-hover:border-yellow-400`}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-2xl backdrop-blur-md"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                      {[<Target />, <Briefcase />, <Brain />, <Rocket />][index]}
                      <h3 className="text-xl font-semibold group-hover:text-yellow-300">
                        {option.title}
                      </h3>
                    </div>
                    <p className="text-gray-100 text-sm md:text-base">
                      {option.subtitle}
                    </p>
                    <div className="mt-4 flex items-center text-blue-200 font-medium">
                      <span>Choose this</span>
                      <span className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300">
                        →
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
            >
              <div className="text-7xl mb-4">
                {selectedGoal.title.split(" ")[0]}
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                {selectedGoal.title.replace(/.*? /, "")}
              </h2>
              <p className="text-base text-blue-100 mb-6 leading-relaxed">
                {selectedGoal.message}
              </p>

              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedGoal(null)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-blue-400/40 border border-white/10 text-base font-medium"
              >
                Back
              </motion.button>

              <div className="mt-6">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    const uid = params.get('uid');
                    window.location.href = `/ques3${uid ? `?uid=${uid}` : ''}`;
                  }}
                  className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-lg hover:scale-105 transition-transform"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}