import React, { useEffect, useMemo, useRef, useState } from "react";
import logo from "./creating.jpg";
import Editor from "@monaco-editor/react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

// Confetti component
function Confetti() {
  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 150;
    const container = document.getElementById('confetti-container');
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(confetti);
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <>
      <style>{`
        #confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          opacity: 0;
          animation: confetti-fall 3s linear forwards;
        }
        @keyframes confetti-fall {
          to {
            top: 100vh;
            opacity: 1;
          }
        }
      `}</style>
      <div id="confetti-container"></div>
    </>
  );
}

const COMPETITION_TIMES = [5, 10, 15];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TOPICS = [
  { name: "C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "C", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "DSA", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2306b6d4'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Cpath d='M7 14l5 5 5-5z'/%3E%3C/svg%3E" }
];

function FinishedScreen({ matchId, currentUser, opponent }) {
  const [matchData, setMatchData] = useState(null);
  
  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, "matches", matchId), (snap) => {
      if (snap.exists()) setMatchData(snap.data());
    });
    return () => unsub();
  }, [matchId]);

  if (!matchData || !currentUser) return <div className="text-center text-gray-900">Loading results...</div>;

  const { status, winnerUid, winReason, results, abandonedBy } = matchData;
  const myResult = results?.[currentUser.uid];
  const oppResult = opponent ? results?.[opponent.uid] : null;
  
  let outcome = "";
  let outcomeColor = "text-gray-900";
  let reason = "";

  if (status === "abandoned") {
    if (abandonedBy === currentUser.uid) {
      outcome = "You Left the Test!";
      outcomeColor = "text-red-600";
      reason = "Your opponent won.";
    } else {
      outcome = "You Won! 🎉";
      outcomeColor = "text-green-600";
      reason = "Test has been discontinued. Your opponent left the test.";
    }
  } else if (status === "completed") {
    if (!winnerUid || (winReason && winReason.startsWith("Draw"))) {
      outcome = "Draw";
      outcomeColor = "text-yellow-600";
      reason = winReason || "Both players had equal results or no submissions.";
    } else if (winnerUid === currentUser.uid) {
      outcome = "Congratulations! You Won! 🎉";
      outcomeColor = "text-green-600";
      reason = winReason || "You performed better.";
    } else {
      outcome = "You Lost";
      outcomeColor = "text-red-600";
      const oppName = opponent?.username || "Your opponent";
      reason = `Sorry! ${oppName} was very powerful. ${winReason ? winReason : 'They performed better'}.`;
    }
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className={`text-6xl font-black ${outcomeColor}`}>{outcome}</div>
      <div className="text-gray-700 text-lg">{reason}</div>
      
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-black font-bold mb-2">You</div>
          <div className="text-gray-900">{currentUser.email?.split("@")[0] || "You"}</div>
          {myResult && (
            <div className="mt-2 text-sm text-gray-600">
              <div>Tests: {myResult.passed || 0}</div>
              <div>Time: {myResult.timeMs || 0} ms</div>
              <div className={myResult.correct ? "text-green-600" : "text-red-600"}>
                {myResult.correct ? "✓ Correct" : "✗ Incorrect"}
              </div>
            </div>
          )}
          {!myResult && <div className="text-gray-500 text-sm mt-2">No submission</div>}
        </div>

        <div className="bg-white border border-gray-300 p-4">
          <div className="text-black font-bold mb-2">Opponent</div>
          <div className="text-gray-900">{opponent?.username || "Opponent"}</div>
          {oppResult && (
            <div className="mt-2 text-sm text-gray-600">
              <div>Tests: {oppResult.passed || 0}</div>
              <div>Time: {oppResult.timeMs || 0} ms</div>
              <div className={oppResult.correct ? "text-green-600" : "text-red-600"}>
                {oppResult.correct ? "✓ Correct" : "✗ Incorrect"}
              </div>
            </div>
          )}
          {!oppResult && <div className="text-gray-500 text-sm mt-2">No submission</div>}
        </div>
      </div>

      <button
        onClick={() => window.location.href = "/compete"}
        className="mt-8 px-8 py-3 bg-black hover:bg-gray-800 text-white font-bold"
      >
        Play Again
      </button>
    </div>
  );
}

export default function Compete({ username = "" }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [resolvedUsername, setResolvedUsername] = useState(username);
  // External questions loaded from /questions.json
  const [questions, setQuestions] = useState([]);
  const [questionsById, setQuestionsById] = useState({});
  const [questionsByDifficulty, setQuestionsByDifficulty] = useState({ Easy: [], Medium: [], Hard: [] });
  const [time, setTime] = useState(COMPETITION_TIMES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [status, setStatus] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [stage, setStage] = useState("setup"); // setup | matching | active | finished
  const [matchId, setMatchId] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [question, setQuestion] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [submissionsLeft, setSubmissionsLeft] = useState(2);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [testResults, setTestResults] = useState([]); // [{in, expected, actual, pass, timeMs}]
  const [isRunning, setIsRunning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef(null);
  const waitingTimeoutRef = useRef(null);
  const matchedUpdateRef = useRef(false);
  const [searchId, setSearchId] = useState(null);

  // Sample questions bank (minimal demo)
  // Load question bank from public/questions.json
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/questions.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load questions.json: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setQuestions(data);
        const byId = {};
        const byDiff = { Easy: [], Medium: [], Hard: [] };
        (data || []).forEach((q) => {
          if (q && q.id) byId[q.id] = q;
          if (q && q.difficulty && byDiff[q.difficulty]) byDiff[q.difficulty].push(q);
        });
        setQuestionsById(byId);
        setQuestionsByDifficulty(byDiff);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch questions.json', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const defaultTemplates = useMemo(() => ({
    javascript: `// Read from stdin (Node.js)
const fs = require('fs');
const input = fs.readFileSync(0,'utf8').trim();
// TODO: parse input and print output
console.log(input);`,
    python: `# Read from stdin (Python)
import sys
data = sys.stdin.read().strip()
print(data)`,
    cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){ios::sync_with_stdio(false);cin.tie(nullptr);
 string s; getline(cin, s); cout<<s; return 0;}
`,
    c: `#include <stdio.h>
int main(){
  char s[10000];
  fgets(s, sizeof(s), stdin);
  printf("%s", s);
  return 0;
}
`,
    java: `import java.io.*;import java.util.*;class Main{public static void main(String[] args)throws Exception{Scanner sc=new Scanner(System.in);String s="";if(sc.hasNextLine())s=sc.nextLine();System.out.print(s);}}`,
  }), []);

  // Derive piston language key from topic
  useEffect(() => {
    const map = {
      "JavaScript": "javascript",
      Python: "python",
      "C++": "cpp",
      C: "c",
      Java: "java",
      DSA: "javascript",
    };
    const lang = map[topic.name] || "javascript";
    setLanguage(lang);
    setCode(defaultTemplates[lang] || "");
  }, [topic, defaultTemplates]);

  // Resolve current user and username
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      if (!resolvedUsername) {
        const fromLocal = localStorage.getItem("username");
        const fallback = u?.email ? u.email.split("@")[0] : "Player";
        setResolvedUsername(fromLocal || fallback);
      }
    });
    return () => unsub();
  }, [resolvedUsername]);

  // Detect if user leaves the page/closes tab during active match
  useEffect(() => {
    if (stage !== "active" || !matchId || !currentUser) return;
    
    const handleBeforeUnload = async (e) => {
      // Mark match as abandoned by this user (browser close/refresh)
      try {
        const mRef = doc(db, "matches", matchId);
        await updateDoc(mRef, {
          status: "abandoned",
          abandonedBy: currentUser.uid,
          abandonedAt: Date.now(),
        });
      } catch (err) {
        // best effort
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [stage, matchId, currentUser]);

  // Matchmaking
  const handleStart = async () => {
    if (!currentUser) {
      setStatus("Please login to start matchmaking.");
      return;
    }
    // Warn if the same account is used on both devices
    if (!resolvedUsername) {
      const fromLocal = localStorage.getItem("username");
      setResolvedUsername(fromLocal || (currentUser.email ? currentUser.email.split("@")[0] : "Player"));
    }
    setIsMatching(true);
    setStatus("Searching for opponent...");

    const specs = { time, difficulty, topic: topic.name };
    let sId = null;
    try {
      // Best-effort: create a search log; continue even if it fails
      sId = await createSearch(specs);
      setSearchId(sId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to create search doc', err);
      setStatus(`Searching (logging disabled): ${err?.code || ''} ${err?.message || ''}`.trim());
    }
    try {
      const id = await joinViaQueueTransaction(specs, sId);
      setMatchId(id);
      subscribeToMatch(id);
      setStage("matching");
      setStatus("Waiting for opponent...");
      // Start a 60s waiting window; if no opponent joins, cancel and reset
      startWaitingTimeout(id, specs);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Matchmaking join/create failed', e);
      if (e?.code === 'permission-denied') {
        setStatus("Permission denied writing to Firestore. Ensure you're signed in and publish Firestore rules for matches/queues/searches.");
      } else if (e?.code === 'failed-precondition') {
        setStatus("Failed precondition (indexes/transactions). Try again or check Firestore settings.");
      } else {
        setStatus("Matchmaking error: " + (e?.message || String(e)));
      }
      setIsMatching(false);
    }
  };

  // Create a public "search" record so you can see who is searching with what options
  const createSearch = async (specs) => {
    const ref = await addDoc(collection(db, "searches"), {
      uid: currentUser.uid,
      username: resolvedUsername,
      specs,
      status: "searching",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  };

  const startWaitingTimeout = (id, specs) => {
    if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
    waitingTimeoutRef.current = setTimeout(async () => {
      try {
        // On timeout, if still waiting alone, expire the match and clear queue pointer
        const queueKey = `${specs.time}|${specs.difficulty}|${specs.topic}`;
        const mRef = doc(db, "matches", id);
        const queueRef = doc(db, "queues", queueKey);
        await runTransaction(db, async (trx) => {
          const mSnap = await trx.get(mRef);
          if (!mSnap.exists()) return;
          const md = mSnap.data();
          if (md.status !== 'waiting') return; // someone likely joined
          const players = md.players || [];
          if (players.length === 1 && players[0]?.uid === currentUser?.uid) {
            trx.update(mRef, { status: 'expired' });
            const qSnap = await trx.get(queueRef);
            if (qSnap.exists() && qSnap.data()?.waitingMatchId === id) {
              trx.set(queueRef, { waitingMatchId: null, updatedAt: serverTimestamp() }, { merge: true });
            }
          }
        });
      } catch (e) {
        // ignore
      } finally {
        if (searchId) {
          try { await updateDoc(doc(db, "searches", searchId), { status: "expired", endedAt: Date.now() }); } catch {}
        }
        setIsMatching(false);
        setStage('setup');
        setStatus('No opponent found in 1 minute. Please try again.');
      }
    }, 60000);
  };

  // Queue-based matchmaking to avoid index issues and races
  const joinViaQueueTransaction = async (specs, sId) => {
    const queueKey = `${specs.time}|${specs.difficulty}|${specs.topic}`;
    const queueRef = doc(db, "queues", queueKey);
    const matchesRef = collection(db, "matches");
    return await runTransaction(db, async (trx) => {
      const qSnap = await trx.get(queueRef);
      let waitingMatchId = qSnap.exists() ? qSnap.data()?.waitingMatchId : null;
      let mRef;
      if (waitingMatchId) {
        // Try to join existing waiting match
        mRef = doc(db, "matches", waitingMatchId);
        const mSnap = await trx.get(mRef);
        if (!mSnap.exists() || mSnap.data().status !== 'waiting') {
          waitingMatchId = null;
        } else {
          const data = mSnap.data();
          const alreadyHasMe = (data.players || []).some(p => p.uid === currentUser.uid);
          if (alreadyHasMe) {
            // Already in this match; just return
            return mRef.id;
          }
          // Avoid serverTimestamp() inside arrays (Firestore restriction)
          const player = { uid: currentUser.uid, username: resolvedUsername, joinedAt: Date.now(), submissionsLeft: 2 };
          const players = [...(data.players || []), player];
          const startedAt = serverTimestamp();
          const questionId = data.questionId || (questionsByDifficulty[specs.difficulty]?.[0]?.id || Object.keys(questionsById)[0] || 'sum-two');
          const updatePayload = { players, status: players.length >= 2 ? 'active' : 'waiting', startedAt: players.length >= 2 ? startedAt : null, questionId };
          if (sId) {
            const searchRefs = Object.assign({}, data.searchRefs || {});
            searchRefs[currentUser.uid] = sId;
            updatePayload.searchRefs = searchRefs;
          }
          trx.update(mRef, updatePayload);
          // Clear queue when match becomes active
          trx.set(queueRef, { waitingMatchId: players.length >= 2 ? null : mRef.id, updatedAt: serverTimestamp() }, { merge: true });
          return mRef.id;
        }
      }
      // Create new match and set in queue
      mRef = doc(matchesRef);
      const pickQuestionId = () => {
        const pool = questionsByDifficulty[specs.difficulty] || [];
        if (pool.length > 0) {
          const idx = Math.floor(Math.random() * pool.length);
          return pool[idx].id;
        }
  const keys = Object.keys(questionsById);
  return keys.length ? keys[0] : 'sum-two';
      };
      const questionId = pickQuestionId();
      const baseMatch = {
        specs,
        status: 'waiting',
        // Avoid serverTimestamp() inside arrays (Firestore restriction)
        players: [{ uid: currentUser.uid, username: resolvedUsername, joinedAt: Date.now(), submissionsLeft: 2 }],
        questionId,
        createdAt: serverTimestamp(),
      };
      if (sId) baseMatch.searchRefs = { [currentUser.uid]: sId };
      trx.set(mRef, baseMatch);
      trx.set(queueRef, { waitingMatchId: mRef.id, updatedAt: serverTimestamp() }, { merge: true });
      return mRef.id;
    });
  };

  const createMatch = async (specs) => {
    const matchesRef = collection(db, "matches");
  const pool = questionsByDifficulty[specs.difficulty] || [];
  const questionId = pool.length ? pool[Math.floor(Math.random()*pool.length)].id : (Object.keys(questionsById)[0] || 'sum-two');
    try {
      const res = await addDoc(matchesRef, {
        specs,
        status: "waiting",
        players: [
          {
            uid: currentUser.uid,
            username: resolvedUsername,
            // Avoid serverTimestamp() inside arrays
            joinedAt: Date.now(),
            submissionsLeft: 2,
          },
        ],
        questionId,
        createdAt: serverTimestamp(),
      });
      setStatus("Waiting for opponent...");
      return res.id;
    } catch (e) {
      if (e?.code === 'permission-denied') {
        setStatus("Permission denied. Please update Firestore rules for matches.");
      } else {
        setStatus("Error creating match: " + (e?.message || String(e)));
      }
      setIsMatching(false);
      throw e;
    }
  };

  const subscribeToMatch = (id) => {
    const mRef = doc(db, "matches", id);
    return onSnapshot(mRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const me = data.players?.find((p) => p.uid === currentUser?.uid);
      const opp = data.players?.find((p) => p.uid !== currentUser?.uid) || null;
      setOpponent(opp);
      // Helpful status for common scenarios
      if (data.status === 'waiting') {
        if (data.players && data.players.length === 1 && me && !opp) {
          setStatus('Waiting for opponent... If you opened another device with the SAME account, it will not match. Please sign in with a different account on the second device.');
        } else {
          setStatus('Waiting for opponent...');
        }
      } else if (data.status === 'active') {
        setStatus('Opponent found! Starting competition...');
        // Cancel waiting timeout if any
        if (waitingTimeoutRef.current) { clearTimeout(waitingTimeoutRef.current); waitingTimeoutRef.current = null; }
        // Mark searches as matched (only once)
        if (!matchedUpdateRef.current) {
          matchedUpdateRef.current = true;
          const sRefs = data.searchRefs || {};
          const mySId = searchId || sRefs[currentUser?.uid];
          const oppSId = opp ? sRefs[opp.uid] : null;
          (async () => {
            try {
              if (mySId) await updateDoc(doc(db, "searches", mySId), { status: "matched", matchId: id, opponentUid: opp?.uid || null, opponentUsername: opp?.username || null, endedAt: Date.now() });
              if (oppSId) await updateDoc(doc(db, "searches", oppSId), { status: "matched", matchId: id, opponentUid: currentUser?.uid || null, opponentUsername: resolvedUsername || null, endedAt: Date.now() });
            } catch {}
          })();
        }
      }
  const qSel = questionsById[data.questionId];
  if (qSel) setQuestion(qSel);
      if (data.status === "active" && data.startedAt) {
        setStage("active");
        // countdown
        const startTs = data.startedAt.toMillis ? data.startedAt.toMillis() : Date.now();
        const endTs = startTs + time * 60 * 1000;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          const now = Date.now();
          const rem = Math.max(0, endTs - now);
          setRemainingMs(rem);
          if (rem === 0) {
            clearInterval(intervalRef.current);
            finishMatchIfNeeded(id);
          }
        }, 500);
      }
      if (data.status === "abandoned") {
        setStage("finished");
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (waitingTimeoutRef.current) { clearTimeout(waitingTimeoutRef.current); waitingTimeoutRef.current = null; }
        const leftUid = data.abandonedBy;
        if (leftUid && leftUid !== currentUser?.uid) {
          setVerdict("Test has been discontinued. Your opponent left the test.");
          setStatus("You win! Your opponent left the game.");
        } else if (leftUid === currentUser?.uid) {
          setVerdict("You left the game.");
          setStatus("Test discontinued.");
        }
      }
      if (data.status === "completed") {
        setStage("finished");
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (waitingTimeoutRef.current) { clearTimeout(waitingTimeoutRef.current); waitingTimeoutRef.current = null; }
      }
    }, (error) => {
      if (error?.code === 'permission-denied') {
        setStatus("Permission denied subscribing to match. Update Firestore rules.");
      } else {
        setStatus("Subscription error: " + (error?.message || String(error)));
      }
      setIsMatching(false);
    });
  };

  const finishMatchIfNeeded = async (id) => {
    const mRef = doc(db, "matches", id);
    try {
      await runTransaction(db, async (trx) => {
        const m = await trx.get(mRef);
        if (!m.exists()) return;
        const d = m.data();
        if (d.status === "completed" || d.status === "abandoned") return;
        // Determine winner
        const results = d.results || {}; // { uid: {correct, timeMs, passed, submittedAt} }
        let winnerUid = null;
        let winReason = "";
        if (results) {
          const entries = Object.entries(results);
          const correct = entries.filter(([, r]) => r.correct);
          if (correct.length === 1) {
            // One user got it right
            winnerUid = correct[0][0];
            winReason = "Solved the problem correctly";
          } else if (correct.length > 1) {
            // Both correct, fastest wins
            correct.sort((a, b) => a[1].submittedAt - b[1].submittedAt);
            winnerUid = correct[0][0];
            winReason = "Submitted correct solution faster";
          } else if (entries.length > 0) {
            // No one got it right: highest passed tests, then earliest submit
            entries.sort((a, b) => {
              const pd = (b[1].passed || 0) - (a[1].passed || 0);
              if (pd !== 0) return pd;
              return (a[1].submittedAt || Infinity) - (b[1].submittedAt || Infinity);
            });
            const best = entries[0];
            const second = entries[1];
            if (!second || (best[1].passed || 0) > (second[1].passed || 0)) {
              winnerUid = best[0];
              winReason = `Passed more tests (${best[1].passed || 0})`;
            } else if ((best[1].passed || 0) === (second[1].passed || 0) && (best[1].submittedAt || Infinity) < (second[1].submittedAt || Infinity)) {
              winnerUid = best[0];
              winReason = `Submitted earlier with same test results`;
            } else {
              // Draw
              winReason = "Draw - both players had equal results";
            }
          } else {
            // No submissions at all
            winReason = "Draw - no submissions";
          }
        }
        trx.update(mRef, { status: "completed", winnerUid, winReason });
      });
    } catch (e) {
      // noop
    }
  };

  // Execute code via Piston API
  const normalize = (s) => (s ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n").map(line => line.replace(/[\t ]+$/g, "")).join("\n")
    .trim();

  const runCode = async (stdin = "", opts = {}) => {
    const silent = !!opts.silent;
    if (!silent) setOutput("Running...");
    // Use Piston canonical language ids
    const langMap = { javascript: "javascript", python: "python", cpp: "cpp", c: "c", java: "java" };
    const fallbackVersions = { javascript: "18.15.0", python: "3.10.0", cpp: "10.2.0", c: "10.2.0", java: "15.0.2" };
    const runtimeStart = performance.now();
    const lang = langMap[language] || language;
    const basePayload = { language: lang, files: [{ content: code }], stdin };
    let data;
    try {
      // Try without version to let Piston pick latest
      let res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });
      data = await res.json();
      // If runtime unknown, retry with a known version
      if (res.status >= 400 || (data && typeof data.message === 'string' && data.message.includes('runtime is unknown'))) {
        const payloadWithVersion = { ...basePayload, version: fallbackVersions[lang] };
        res = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadWithVersion),
        });
        data = await res.json();
      }
      const rt = Math.round(performance.now() - runtimeStart);
      const stdout = data?.run?.stdout ?? "";
      const stderr = data?.run?.stderr ?? "";
      const combined = (stdout || stderr) ? `${stdout}${stderr ? (stdout ? "\n" : "") + stderr : ""}` : (data?.message ? data.message : JSON.stringify(data));
      if (!silent) setOutput(combined + ("\n\nTime: " + rt + " ms"));
      return { stdout, stderr, combined, timeMs: rt };
    } catch (e) {
      if (!silent) setOutput("Error: " + e.message);
      return { stdout: "", stderr: "", combined: "", timeMs: 0, error: e };
    }
  };

  const runWithCustomInput = async () => {
    setIsRunning(true);
    setOutput(""); // Clear previous output/errors
    setVerdict(""); // Clear previous verdict
    try {
      // Run the program using user's provided stdin and show raw program output
      await runCode(customInput || "");
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    if (!question) return [];
    setIsTesting(true);
    setOutput(""); // Clear previous output/errors
    setVerdict(""); // Clear previous verdict
    setTestResults([]); // Clear old test results
    const results = [];
    for (const t of question.tests) {
      const { stdout, timeMs } = await runCode(t.in, { silent: true });
      const actual = normalize(stdout);
      const expected = normalize(t.out);
      results.push({ in: t.in, expected: t.out, actual: stdout, pass: actual === expected, timeMs });
    }
    const passed = results.filter(r => r.pass).length;
    setTestResults(results);
    setVerdict(passed === question.tests.length ? "All sample tests passed" : `Passed ${passed}/${question.tests.length} sample tests`);
    setIsTesting(false);
    return results;
  };

  const evaluateAndSubmit = async () => {
    if (submissionsLeft <= 0) {
      setVerdict("No submissions left");
      return;
    }
    if (!question) return;
    setOutput(""); // Clear previous output/errors
    setVerdict("Evaluating against tests...");
    setTestResults([]); // Clear old test results
    setIsSubmitting(true);
    const results = await runAllTests();
    const passed = results.filter(r => r.pass).length;
    const worstTime = results.reduce((m, r) => Math.max(m, r.timeMs || 0), 0);
    const correct = passed === (question?.tests?.length || 0);
    if (correct) {
      setVerdict("Accepted - Congratulations! 🎉");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    setSubmissionsLeft((x) => x - 1);

    // Record result in match doc
    if (matchId && currentUser) {
      const mRef = doc(db, "matches", matchId);
      let shouldFinishAfter = false;
      try {
        await runTransaction(db, async (trx) => {
          const m = await trx.get(mRef);
          if (!m.exists()) return;
          const d = m.data();
          const results = d.results || {};
          if (!results[currentUser.uid]) {
            results[currentUser.uid] = {};
          }
          results[currentUser.uid] = {
            correct,
            passed,
            timeMs: worstTime,
            submittedAt: Date.now(),
          };
          trx.update(mRef, { results });

          // Decide outside of the transaction whether to finish match
          if (correct) {
            const players = d.players || [];
            if (players.length === 2) {
              shouldFinishAfter = true;
            }
          }
        });
        // Important: call finish AFTER transaction commits so results are visible
        if (shouldFinishAfter) {
          await finishMatchIfNeeded(matchId);
        }
      } catch (e) {
        // ignore
      }
    }
    setIsSubmitting(false);
  };

  const handleExitTest = async () => {
    if (!matchId || !currentUser || stage !== "active") return;
    
    const confirmExit = window.confirm("Are you sure you want to exit this test? Your opponent will win automatically.");
    if (!confirmExit) return;

    try {
      const mRef = doc(db, "matches", matchId);
      await updateDoc(mRef, {
        status: "abandoned",
        abandonedBy: currentUser.uid,
        abandonedAt: Date.now(),
      });
      setStage("finished");
      setVerdict("You left the test!");
      setStatus("Your opponent won.");
    } catch (err) {
      console.error("Error exiting test:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      {showConfetti && <Confetti />}
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src={logo}
              alt="SkillIgnite Logo" 
              className="w-12 h-12 rounded-full object-cover"
            />
            <h2 className="text-4xl font-black text-black">BYTEFORCE</h2>
          </div>
          <div className="inline-block bg-black px-10 py-6 mb-4">
            <h1 className="text-5xl font-black text-white">
              1 <span className="text-gray-400">VS</span> 1
            </h1>
          </div>
          <p className="text-gray-600">{stage === 'setup' ? 'Choose your battle settings' : stage === 'matching' ? status || 'Matching...' : stage === 'active' ? 'Battle in progress' : 'Match finished'}</p>
        </div>

        <div className="bg-white border border-gray-200 p-8">
          {stage === 'setup' && (
            <>
          {/* Player */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-black p-2.5">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-black">{resolvedUsername || 'Player'}</span>
            </div>
            <div className="bg-black px-4 py-2">
              <span className="text-white text-sm font-bold">● READY</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Time */}
              <div>
                <label className="text-black font-bold mb-3 block text-sm uppercase tracking-wide">Duration</label>
                <div className="space-y-2">
                  {COMPETITION_TIMES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`w-full py-3 font-bold transition-all text-left px-4 border ${
                        time === t
                          ? 'bg-black border-black text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-black'
                      }`}
                    >
                      {t} Minutes
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-black font-bold mb-3 block text-sm uppercase tracking-wide">Difficulty</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setDifficulty('Easy')}
                    className={`w-full py-3 font-bold transition-all text-left px-4 border ${
                      difficulty === 'Easy'
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => setDifficulty('Medium')}
                    className={`w-full py-3 font-bold transition-all text-left px-4 border ${
                      difficulty === 'Medium'
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setDifficulty('Hard')}
                    className={`w-full py-3 font-bold transition-all text-left px-4 border ${
                      difficulty === 'Hard'
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Hard
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Languages */}
            <div>
              <label className="text-black font-bold mb-3 block text-sm uppercase tracking-wide">Language</label>
              <div className="grid grid-cols-2 gap-3">
                {TOPICS.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setTopic(t)}
                    className={`py-4 font-bold transition-all border flex flex-col items-center space-y-2 ${
                      topic.name === t.name
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    <img src={t.logo} alt={t.name} className="w-10 h-10" />
                    <span className="text-xs">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            className={`w-full py-5 font-black text-xl transition-all ${
              isMatching
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800 active:scale-98'
            }`}
            onClick={handleStart}
            disabled={isMatching}
          >
            {isMatching ? (
              <span className="flex items-center justify-center space-x-3">
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>FINDING OPPONENT...</span>
              </span>
            ) : (
              'START MATCH'
            )}
          </button>
            </>
          )}

          {stage === 'matching' && (
            <div className="mt-2 bg-gray-100 border border-gray-300 p-4 text-center">
              <span className="text-black font-bold">{status || 'Waiting for opponent...'}</span>
            </div>
          )}

          {stage === 'active' && question && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-100 border border-gray-300 p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">You</div>
                      <div className="text-lg font-bold text-black">{resolvedUsername || 'Player'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Opponent</div>
                      <div className="text-lg font-bold text-black">{opponent?.username || 'Waiting...'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm">
                    Time Remaining
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExitTest}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm"
                    >
                      Exit Test
                    </button>
                    <div className="bg-black px-4 py-2 text-white font-bold">
                      {Math.floor(remainingMs/60000).toString().padStart(2,'0')}:{Math.floor((remainingMs%60000)/1000).toString().padStart(2,'0')}
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-300 p-4">
                  <h3 className="text-black font-bold text-xl mb-2">{question.title}</h3>
                  <p className="text-gray-700 mb-2">{question.statement}</p>
                  <div className="text-gray-600 text-sm">
                    <div><span className="font-bold text-gray-900">Input: </span>{question.input}</div>
                    <div><span className="font-bold text-gray-900">Output: </span>{question.output}</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-300 p-4">
                  <div className="text-gray-900 font-bold mb-2">Sample Tests</div>
                  <div className="space-y-2">
                    {question.tests.map((t,idx)=>(
                      <div key={idx} className="grid grid-cols-2 gap-2 text-sm">
                        <div className="space-y-1">
                          <pre className="bg-gray-100 p-2 whitespace-pre-wrap border border-gray-200">In:<br />{t.in}</pre>
                          <button onClick={()=>setCustomInput(t.in)} className="text-black text-xs hover:underline">↳ Use as program input</button>
                        </div>
                        <pre className="bg-gray-100 p-2 whitespace-pre-wrap border border-gray-200">Out:<br />{t.out}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-gray-900 font-bold">Language</div>
                  <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="bg-white border border-gray-300 text-black px-2 py-1">
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <div className="h-[360px] border border-gray-300 overflow-hidden">
                  <Editor height="100%" theme="vs-dark" defaultLanguage={language} language={language} value={code} onChange={(v)=>setCode(v||"")}/>
                </div>
                <div>
                  <div className="text-gray-900 font-bold mb-1">Program Input (stdin)</div>
                  <textarea value={customInput} onChange={(e)=>setCustomInput(e.target.value)} className="w-full bg-white text-gray-900 border border-gray-300 p-2 h-24" placeholder="Type input here..." />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={runWithCustomInput} disabled={isRunning || isTesting || isSubmitting} className={`flex-1 py-3 font-bold ${isRunning || isTesting || isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {isRunning ? (
                      <span className="flex items-center justify-center space-x-2"><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>RUNNING...</span></span>
                    ) : 'Run'}
                  </button>
                  <button onClick={runAllTests} disabled={isTesting || isRunning || isSubmitting} className={`flex-1 py-3 font-bold ${isTesting || isRunning || isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}>
                    {isTesting ? (
                      <span className="flex items-center justify-center space-x-2"><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>CHECKING...</span></span>
                    ) : 'Run Tests'}
                  </button>
                  <button onClick={evaluateAndSubmit} disabled={submissionsLeft<=0 || isSubmitting || isRunning || isTesting} className={`flex-1 py-3 font-bold ${submissionsLeft>0 && !isSubmitting && !isRunning && !isTesting ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                    {isSubmitting ? (
                      <span className="flex items-center justify-center space-x-2"><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>SUBMITTING...</span></span>
                    ) : `Submit (${submissionsLeft} left)`}
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-300 p-3 text-gray-900 whitespace-pre-wrap min-h-[100px]">
                  {verdict && (<div className={`mb-2 font-bold ${verdict.includes('Accepted')?'text-green-600':'text-yellow-600'}`}>{verdict}</div>)}
                  {output}
                  {testResults && testResults.length>0 && (
                    <div className="mt-3 text-sm">
                      <div className="font-bold text-gray-900 mb-1">Test Results</div>
                      <div className="space-y-2">
                        {testResults.map((r,i)=> (
                          <div key={i} className={`border p-2 ${r.pass?'border-green-600 bg-green-50':'border-red-600 bg-red-50'}`}>
                            <div className="flex items-center justify-between">
                              <div className={`font-bold ${r.pass?'text-green-600':'text-red-600'}`}>Test {i+1}: {r.pass? 'PASS':'FAIL'}</div>
                              <div className="text-gray-600">Time: {r.timeMs ?? 0} ms</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                              <pre className="bg-white p-2 border border-gray-200 whitespace-pre-wrap"><span className="text-gray-600">In</span><br />{r.in}</pre>
                              <pre className="bg-white p-2 border border-gray-200 whitespace-pre-wrap"><span className="text-gray-600">Expected</span><br />{r.expected}</pre>
                              <pre className="bg-white p-2 border border-gray-200 whitespace-pre-wrap"><span className="text-gray-600">Actual</span><br />{r.actual}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {stage === 'finished' && (
            <FinishedScreen matchId={matchId} currentUser={currentUser} opponent={opponent} />
          )}
        </div>
      </div>
    </div>
  );
}