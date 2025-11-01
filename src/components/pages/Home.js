import React, { useState, useEffect } from "react";
import logo from "./creating.jpg";
import heroVideo from "./hero1.mp4";
import { Login, Signup, ForgetPasswordPage } from "./auth";

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModal, setAuthModal] = useState(null); // 'login', 'signup', or null

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="font-sans text-gray-900 bg-white scroll-smooth overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-6 left-6 right-6 z-50 rounded-full border transition-all duration-300 ${
        isScrolled
          ? 'bg-white/70 backdrop-blur-xl shadow-xl border-white/40'
          : 'bg-white/90 backdrop-blur-lg border-gray-200 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Skill Ignite Logo"
              className="w-10 h-10 rounded-full"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skill Ignite
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Platform</a>
            <a href="#courses" className="hover:text-gray-900 transition">Learning</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setAuthModal('login')}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Login
            </button>
            <button 
              onClick={() => setAuthModal('signup')}
              className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition"
            >
              Sign up →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Screen */}
      <section className="min-h-screen pt-20 flex items-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
            style={{
              transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                AI-Powered Learning Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Free your story
              </span>
              <br />
              <span className="text-gray-900">
                AI coding mentor
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Fast, simple, and incredibly powerful. Start with your goals, then our AI mentor creates personalized learning paths, complete with code reviews, interview prep, and real-world projects that match your career aspirations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Get started for free</span>
                <span>→</span>
              </button>
              <button 
                onClick={() => (window.location.href = '/ide')}
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-300"
              >
                Try Online IDE
              </button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                </div>
                <span className="font-medium">10k+ learners</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★★★★★</span>
                <span className="font-medium">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right Content - Video Showcase */}
          <div className="relative h-full flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Main Video Card */}
              <div 
                className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500"
                style={{
                  transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
                }}
              >
                <div className="aspect-[9/16] bg-black relative overflow-hidden">
                  {/* Video */}
                  <video 
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    src={heroVideo}
                  >
                    <source src={heroVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Optional overlay for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Floating particles */}
                  <div className="absolute top-10 left-10 w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                  <div className="absolute top-20 right-16 w-3 h-3 bg-white/40 rounded-full animate-pulse delay-100"></div>
                  <div className="absolute bottom-24 left-20 w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>

              {/* Floating Secondary Card - Top */}
              <div 
                className="absolute -top-8 -left-8 w-40 bg-white rounded-2xl shadow-xl p-4 transform hover:scale-110 transition-all duration-300"
                style={{
                  transform: `translate(${mousePosition.x * 1.5}px, ${mousePosition.y * 1.5}px)`,
                }}
              >
                <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mb-2 flex items-center justify-center overflow-hidden relative">
                  {/* Checkmark icon for Code Review */}
                  <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  {/* Pulse animation ring */}
                  <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-pulse" />
                </div>
                <div className="text-xs font-semibold text-gray-800">Code Review</div>
                <div className="text-xs text-gray-500">Instant feedback</div>
              </div>

              {/* Floating Tertiary Card - Bottom */}
              <div 
                className="absolute -bottom-8 -right-8 w-40 bg-white rounded-2xl shadow-xl p-4 transform hover:scale-110 transition-all duration-300"
                style={{
                  transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`,
                }}
              >
                <div className="aspect-square bg-gradient-to-br from-orange-400 to-red-500 rounded-xl mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-gray-800">Live Projects</div>
                <div className="text-xs text-gray-500">Build portfolio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Why Choose Skill Ignite?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Blend AI-powered mentorship with hands-on practice to transform from learning to doing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "AI Mentors", 
                desc: "Personalized guidance with instant code reviews and tailored learning paths",
                icon: "🤖",
                color: "from-blue-500 to-cyan-500"
              },
              { 
                title: "Interview Prep", 
                desc: "Practice with realistic scenarios and get actionable feedback",
                icon: "💼",
                color: "from-purple-500 to-pink-500"
              },
              { 
                title: "Live Projects", 
                desc: "Build portfolio-ready projects with real-world challenges",
                icon: "⚡",
                color: "from-orange-500 to-red-500"
              },
              { 
                title: "Career Growth", 
                desc: "Resume coaching and interview practice to land your dream role",
                icon: "🚀",
                color: "from-green-500 to-emerald-500"
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group relative bg-gradient-to-br from-gray-50 to-white hover:shadow-2xl rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm">© 2025 Skill Ignite. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Auth Content */}
            <div className="p-8">
              {authModal === 'login' && (
                <Login 
                  switchToSignup={() => setAuthModal('signup')}
                  goToForget={() => setAuthModal('forget')}
                  onGoogleSignIn={() => {}}
                />
              )}
              {authModal === 'signup' && (
                <Signup 
                  switchToLogin={() => setAuthModal('login')}
                />
              )}
              {authModal === 'forget' && (
                <ForgetPasswordPage
                  goToLogin={() => setAuthModal('login')}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;