import React, { useState } from "react";
import { Code, Cpu, Database, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Ques3() {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const skills = [
    {
      id: "frontend",
      title: "💻 Frontend Development",
      desc: "Building beautiful user interfaces with HTML, CSS, and JavaScript frameworks like React.",
      message: "Frontend is about creativity and structure 🎨 — bring ideas to life through design and interactivity!",
    },
    {
      id: "backend",
      title: "⚙️ Backend Development",
      desc: "Designing APIs, managing databases, and handling logic using Node.js, Python, or Java.",
      message: "Backend developers build the foundation 🔥 — logic, APIs, and power behind every great app!",
    },
    {
      id: "ai",
      title: "🧠 AI & Machine Learning",
      desc: "Exploring intelligent systems, data models, and neural networks to solve complex problems.",
      message: "AI is shaping the future 🚀 — your curiosity can make you part of the revolution!",
    },
    {
      id: "cloud",
      title: "☁️ Cloud & DevOps",
      desc: "Automating deployment, scaling systems, and managing infrastructure with tools like AWS or Docker.",
      message: "Cloud engineers make magic happen at scale 🌩️ — reliability meets innovation!",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#050A1A] flex items-center justify-center overflow-hidden text-white font-sans">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2017/08/30/01/05/network-2693380_1280.jpg')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#050A1A]/95 via-[#0b1228]/85 to-[#050A1A]/95"></div>

      {/* Glowing Orbs */}
      <div className="absolute w-72 h-72 bg-blue-500 blur-3xl opacity-20 top-10 left-20 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-purple-500 blur-3xl opacity-20 bottom-10 right-20 animate-pulse"></div>

      {/* Main Content */}
      <div className="relative z-10 w-[90%] max-w-5xl text-center scale-95">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Which Area Interests You the Most?
        </motion.h1>

        <AnimatePresence mode="wait">
          {!selectedSkill ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4"
            >
              {skills.map((skill, index) => (
                <motion.button
                  key={skill.id}
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    const uid = params.get('uid');
                    window.location.href = `/ques4${uid ? `?uid=${uid}` : ''}`;
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group bg-gradient-to-br from-indigo-600 to-blue-600 p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-blue-400/40 text-left transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-black/40 rounded-2xl backdrop-blur-md"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3 text-2xl">
                      {[<Code />, <Cpu />, <Database />, <Cloud />][index]}
                      <span className="font-semibold group-hover:text-yellow-300">
                        {skill.title}
                      </span>
                    </div>
                    <p className="text-blue-100 text-sm">{skill.desc}</p>
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
              className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg"
            >
              <div className="text-7xl mb-4">
                {selectedSkill.title.split(" ")[0]}
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                {selectedSkill.title.replace(/.*? /, "")}
              </h2>
              <p className="text-blue-100 mb-6 leading-relaxed">
                {selectedSkill.message}
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedSkill(null)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-blue-400/40 border border-white/10 text-base font-medium"
              >
                Back
              </motion.button>

              <div className="mt-6">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    const uid = params.get('uid');
                    window.location.href = `/ques4${uid ? `?uid=${uid}` : ''}`;
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