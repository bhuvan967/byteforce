import React, { useState, useEffect } from "react";
import { Menu, X, BarChart2, Clock, CheckCircle, Bell, Settings, LogOut, Code2, Trophy, Briefcase, FolderKanban, BookOpen } from "lucide-react";
import profile from "./creating.jpg";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [uid, setUid] = useState("");
  const [username, setUsername] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auth guard and ensure uid in URL
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/";
        return;
      }
      const currentUid = user.uid;
      setUid(currentUid);
      // Extract username from email (before @)
      let uname = "";
      if (user.email) {
        uname = user.email.split("@")[0];
      }
  setUsername(uname);
  localStorage.setItem('username', uname);
      const url = new URL(window.location.href);
      const existing = url.searchParams.get("uid");
      if (!existing || existing !== currentUid) {
        url.searchParams.set("uid", currentUid);
        window.history.replaceState({}, "", url.toString());
      }
      localStorage.setItem("uid", currentUid);
    });

    const newNotif = { id: Date.now(), text: "🚀 New Challenge Available: Arrays Advanced!" };
    setNotifications([newNotif]);
    const timer = setTimeout(() => setNotifications([]), 5000);
    return () => { clearTimeout(timer); unsub(); };
  }, []);

  // Modal open/close helpers with transition
  useEffect(() => {
    let t;
    if (showLogoutModal) {
      // show DOM then kick in visible state to trigger enter transition
      t = setTimeout(() => setModalVisible(true), 10);
    } else {
      setModalVisible(false);
    }
    return () => clearTimeout(t);
  }, [showLogoutModal]);

  // Close modal on Escape (use close helper so transitions run)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeModal();
    }
    if (showLogoutModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLogoutModal]);

  const openModal = () => {
    setShowLogoutModal(true);
  };

  const closeModal = () => {
    // start exit transition
    setModalVisible(false);
    // remove DOM after transition duration (200ms)
    setTimeout(() => setShowLogoutModal(false), 220);
  };

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      setLogoutLoading(false);
    }
  };

  const courses = [
    { title: "Mastering Python", level: "Beginner", duration: "8 weeks", logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", language: "Python" },
    { title: "Advanced C++", level: "Advanced", duration: "12 weeks", logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg", language: "C++" },
    { title: "JavaScript Pro", level: "Intermediate", duration: "10 weeks", logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", language: "JavaScript" },
    { title: "Data Structures in C", level: "Intermediate", duration: "6 weeks", logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg", language: "C" },
    { title: "React Masterclass", level: "Advanced", duration: "8 weeks", logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", language: "React" },
    { title: "Java Complete Guide", level: "Beginner", duration: "14 weeks", logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", language: "Java" },
  ];

  return (
    <div className="flex min-h-screen bg-white font-sans text-black overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white text-black transition-all duration-300 ease-in-out z-30 shadow-sm border-r border-gray-200 ${
          sidebarOpen ? "w-72" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b border-gray-200">
          <div className={`text-2xl font-extrabold tracking-wide transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}>
            <span className="text-black">Byteforce</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

  <nav className="mt-8 px-3 space-y-2 flex-1 overflow-y-auto">
          {[
            { name: "Courses", icon: BookOpen, path: "/courses" },
            { name: "Practice", icon: Code2, path: "/ide" },
            { name: "Compete", icon: Trophy, path: "/compete" },
            { name: "Interview Prep", icon: Briefcase, path: "/interview-prep" },
            { name: "Projects", icon: FolderKanban, path: "/projects" },
          ].map((item, i) => (
            <button
              key={i}
              className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-base font-medium hover:bg-gray-100 transition-all duration-200 relative ${
                sidebarOpen ? "justify-start" : "justify-center"
              }`}
              title={item.name}
              style={{ animationDelay: `${i * 100}ms` }}
              onClick={() => {
                if (item.path) {
                  window.location.href = item.path;
                }
              }}
            >
              <item.icon className="w-5 h-5 transition-transform duration-200 relative z-10" />
              {sidebarOpen && <span className="transition-all duration-300 relative z-10">{item.name}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {item.name}
                </div>
              )}
            </button>
          ))}
        </nav>
        
  <div className="mt-auto px-3 space-y-2 pb-6 border-t border-gray-200 pt-4">
          <button
            className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-base font-medium hover:bg-gray-100 transition-all duration-200 relative ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5 relative z-10" />
            {sidebarOpen && <span className="relative z-10">Settings</span>}
            {!sidebarOpen && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Settings
              </div>
            )}
          </button>
          <button
            onClick={openModal}
            className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-base font-medium hover:bg-gray-100 transition-all duration-200 relative ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 relative z-10" />
            {sidebarOpen && <span className="relative z-10">Logout</span>}
            {!sidebarOpen && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"} p-10 relative z-10`}>        
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <h1 className="text-5xl font-extrabold mb-2 text-black">
              Welcome Back, {username ? username : "User"} 👋
            </h1>
            <p className="text-lg text-gray-600">Keep up your coding journey with Byteforce.</p>
          </div>

          <div className={`flex items-center gap-4 mt-4 md:mt-0 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <input
              type="search"
              placeholder="Search courses, projects..."
              className="border border-gray-300 rounded-lg px-5 py-2.5 w-72 text-base focus:outline-none focus:border-black transition-all duration-200 focus:w-80"
            />
            <div className="relative">
              <button className="p-3 rounded-full hover:bg-gray-100 transition-all duration-200 relative group">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full px-1.5 py-0.5">3</span>
              </button>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="absolute right-0 mt-2 w-64 bg-white text-black shadow-lg rounded-xl p-4 text-sm border border-gray-200 animate-slideIn"
                  style={{ animation: 'slideIn 0.5s ease-out' }}
                >
                  {notif.text}
                </div>
              ))}
            </div>
            <div className="relative group">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 shadow-sm ring-2 ring-black/5">
                <img 
                  src={profile} 
                  alt="Profile" 
                  className="w-full h-full rounded-full"
                />
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-gray-200">
                <p className="font-semibold text-black">Your Profile</p>
                <p className="text-sm text-gray-600 mt-1">Level 12 • 2,450 XP</p>
              </div>
            </div>
          </div>
        </header>

  <section className={`grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Learning Progress */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-700 text-lg font-semibold">Learning Progress</p>
                  <h2 className="text-4xl font-bold text-black">68%</h2>
                </div>
                <BarChart2 className="w-10 h-10 text-gray-700" />
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-3 bg-black rounded-full transition-all duration-700" style={{ width: mounted ? '68%' : '0%' }}></div>
              </div>
              <p className="mt-3 text-gray-700">You completed 12 lessons this month.</p>
            </div>
          </div>

          {/* Active Courses */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-700 text-lg font-semibold">Active Courses</p>
                  <h2 className="text-4xl font-bold text-black">4</h2>
                </div>
                <CheckCircle className="w-10 h-10 text-gray-700" />
              </div>
              <p className="text-gray-700">You're making great progress!</p>
            </div>
          </div>

          {/* Next Challenge */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-700 text-lg font-semibold">Next Challenge</p>
                  <h2 className="text-3xl font-bold text-black">Array Mastery</h2>
                </div>
                <Clock className="w-10 h-10 text-gray-700" />
              </div>
              <p className="text-gray-700">Starts in 1d 14h 39m 38s</p>
            </div>
          </div>
        </section>

        <section className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-bold text-2xl mb-6 text-black flex items-center gap-2">
              <div className="w-1 h-8 bg-black rounded-full"></div>
              Recent Activity
            </h3>
            <ul className="space-y-4">
              {[
                { title: "Completed: Intro to React", time: "2 hours ago", xp: "+10 XP", status: "completed" },
                { title: "Attempted: Sorting Challenge", time: "Yesterday", xp: "In Progress", status: "progress" }
              ].map((activity, i) => (
                <li 
                  key={i}
                  className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-lg hover:border-black transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div>
                    <p className="text-lg font-medium text-black">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                  <span className={`font-semibold ${activity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{activity.xp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="font-bold text-2xl mb-6 text-black flex items-center gap-2">
              <div className="w-1 h-8 bg-black rounded-full"></div>
              Your Achievements
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Problems Solved", value: "142", icon: "🎯" },
                { label: "Contests Won", value: "8", icon: "🏆" },
                { label: "Streak Days", value: "23", icon: "🔥" },
                { label: "Projects Built", value: "5", icon: "🚀" }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-black transition-all duration-200 text-center cursor-pointer"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Courses Section */}
        <section className={`mb-10 transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-3xl text-black flex items-center gap-3">
              <div className="w-1.5 h-10 bg-black rounded-full"></div>
              Recommended Courses
            </h3>
            <button className="text-black hover:underline font-semibold transition-colors duration-200">View All →</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <div 
                key={i}
                className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-full">
                  {/* Left side - Logo */}
                  <div className="w-2/5 bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src={course.logoUrl}
                      alt={`${course.language} logo`}
                      className="w-20 h-20 object-contain relative z-10"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold text-center bg-black/40 rounded-lg py-1">
                      {course.language}
                    </div>
                  </div>
                  
                  {/* Right side - Details */}
                  <div className="w-3/5 p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-black mb-2">
                        {course.title}
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {course.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">📅 {course.duration}</p>
                      </div>
                    </div>
                    
                    <button className="mt-4 w-full bg-black text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
              onClick={closeModal}
            ></div>

            {/* modal */}
            <div className={`relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 z-50 transform transition-all duration-200 ${modalVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}>
              <div className="flex items-start gap-4">
                <div className="flex-none bg-red-50 rounded-full p-3">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black">Confirm Logout</h3>
                  <p className="text-sm text-gray-600 mt-1">Are you sure you want to log out? You will be redirected to the home page.</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                  onClick={closeModal}
                  disabled={logoutLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${logoutLoading ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                  onClick={handleConfirmLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? 'Signing out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;