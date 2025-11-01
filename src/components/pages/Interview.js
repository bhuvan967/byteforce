import React, { useState, useRef, useEffect } from 'react';
import '../../components/interview/Interview.css';
import VideoGrid from '../../components/interview/VideoGrid';
import Controls from '../../components/interview/Controls';
import QuestionPanel from '../../components/interview/QuestionPanel';
import Transcript from '../../components/interview/Transcript';

const INTERVIEW_SECONDS = 60 * 5; // 5 minutes (kept internal)

function Interview({ onExit }) {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(INTERVIEW_SECONDS);
  const [lines, setLines] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [report, setReport] = useState(null);
  const [aiText, setAiText] = useState('');
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => setSecondsLeft(s => s-1), 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (secondsLeft <= 0 && running) {
      stopInterview();
    }
  }, [secondsLeft]);

  const sendToAI = async (type, payload = {}) => {
    // type: 'init' | 'user' | 'finalize'
    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...payload }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      // server expected to return { reply: string, report?: object }
      if (json.reply) {
        setAiText(json.reply);
        // speak the AI reply
        try {
          const utter = new SpeechSynthesisUtterance(json.reply);
          utter.lang = 'en-US';
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
        } catch (e) {
          console.warn('TTS not available', e);
        }
      }
      if (json.report) setReport(json.report);
      return json;
    } catch (err) {
      console.error('AI converse error', err);
      setAiText('AI is unavailable.');
      setReport({ error: true, message: err.message });
      return null;
    }
  };

  const startInterview = async () => {
    // ask for user name and role via simple prompts (replace with proper modal if desired)
    const name = window.prompt('Hello — what is your full name?');
    if (!name) { alert('Name is required to proceed.'); return; }
    const role = window.prompt('Which role are you preparing for?');
    if (!role) { alert('Role is required to proceed.'); return; }
    setUserName(name);
    setUserRole(role);

    setLines([]);
    setSnapshot(null);
    setReport(null);
    setSecondsLeft(INTERVIEW_SECONDS);
    setRunning(true);

    // initialize AI conversation (server will use OpenAI/Google Gemini with API key)
    await sendToAI('init', { name, role });

    // start speech recognition (browser Web Speech API)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const r = new SpeechRecognition();
      r.continuous = true;
      r.interimResults = false; // we send final results only
      r.lang = 'en-US';
      r.onresult = async (ev) => {
        const texts = [];
        for (let i=ev.resultIndex;i<ev.results.length;i++) {
          texts.push(ev.results[i][0].transcript);
        }
        const utter = texts.join(' ');
        setLines(prev => [...prev, utter]);
        // send user utterance to AI to get next reply/question
        await sendToAI('user', { name: userName || name, role: userRole || role, utterance: utter, transcript: [...lines, utter] });
      };
      r.onerror = (e) => console.warn('Speech recognition error', e);
      r.start();
      recognitionRef.current = r;
    }
  };

  const stopInterview = async () => {
    setRunning(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
      recognitionRef.current = null;
    }
    // ask server to finalize and generate report
    try {
      const payload = {
        name: userName || 'Unknown',
        role: userRole || 'Unknown',
        timestamp: new Date().toISOString(),
        durationSeconds: INTERVIEW_SECONDS - secondsLeft,
        transcriptLines: lines,
        snapshotBase64: snapshot,
      };
      const resJson = await sendToAI('finalize', payload);
      if (resJson && resJson.report) setReport(resJson.report);
    } catch (err) {
      setReport({ error: true, message: err.message || String(err) });
    }
  };

  const handleSnapshot = (data) => setSnapshot(data);

  const handleExit = () => {
    if (running) stopInterview();
    onExit && onExit();
  };

  return (
    <div className="interview-root">
      <div style={{padding:12}}>
        {!running ? (
          <button style={{marginLeft:12}} onClick={startInterview}>Start Interview</button>
        ) : (
          <button style={{marginLeft:12}} onClick={stopInterview}>Stop Interview</button>
        )}
      </div>

      <div className="interview-main">
        <VideoGrid onSnapshot={handleSnapshot} />
        <div className="interview-side">
          <QuestionPanel aiText={aiText} />
          <Transcript lines={lines} />
        </div>
      </div>

      <Controls onExit={handleExit} />

      {report && (
        <div style={{position:'fixed',left:20,bottom:20,background:'#fff',color:'#000',padding:12,borderRadius:8,maxWidth:520}}>
          <h4>Interview Report</h4>
          {report.error ? (
            <div style={{color:'red'}}>Error: {report.message}</div>
          ) : (
            <>
              <div><strong>Name:</strong> {report.name}</div>
              <div><strong>Role:</strong> {report.role}</div>
              <div><strong>Timestamp:</strong> {report.timestamp}</div>
              <div><strong>Duration (s):</strong> {report.durationSeconds}</div>
              <div><strong>Strengths:</strong>
                <ul>{(report.strengths||[]).map((s,i)=><li key={i}>{s}</li>)}</ul>
              </div>
              <div><strong>Weaknesses:</strong>
                <ul>{(report.weaknesses||[]).map((s,i)=><li key={i}>{s}</li>)}</ul>
              </div>
            </>
          )}
          <div style={{marginTop:8}}><button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(report, null, 2))}}>Copy Report JSON</button></div>
        </div>
      )}
    </div>
  );
}

export default Interview;
