import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function ProjectIDE() {
  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState("");
  const [completed, setCompleted] = useState(false);

  // Extract questionId from URL pathname
  const questionId = window.location.pathname.split('/projects/')[1] || '';

  useEffect(() => {
    // Load question from questions.json
    (async () => {
      try {
        const res = await fetch('/questions.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('Failed to load questions');
        const data = await res.json();
        const q = data.find(item => item.id === questionId);
        if (q) {
          setQuestion(q);
          // Check if already completed
          const completedQuestions = JSON.parse(localStorage.getItem('completedQuestions') || '[]');
          setCompleted(completedQuestions.includes(questionId));
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [questionId]);

  // Default code templates
  const defaultTemplates = {
    javascript: `// Read from stdin (Node.js)
const fs = require('fs');
const input = fs.readFileSync(0,'utf8').trim();
// TODO: parse input and print output
console.log(input);`,
    python: `# Read from stdin
import sys
data = sys.stdin.read().strip()
print(data)`,
    cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  string s;
  getline(cin, s);
  cout << s;
  return 0;
}`,
    c: `#include <stdio.h>
int main(){
  char s[10000];
  fgets(s, sizeof(s), stdin);
  printf("%s", s);
  return 0;
}`,
    java: `import java.io.*;
import java.util.*;
class Main {
  public static void main(String[] args) throws Exception {
    Scanner sc = new Scanner(System.in);
    String s = "";
    if(sc.hasNextLine()) s = sc.nextLine();
    System.out.print(s);
  }
}`
  };

  useEffect(() => {
    setCode(defaultTemplates[language] || "");
  }, [language]);

  const normalize = (s) => (s ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n").map(line => line.replace(/[\t ]+$/g, "")).join("\n")
    .trim();

  const runCode = async (stdin = "", opts = {}) => {
    const silent = !!opts.silent;
    if (!silent) setOutput("Running...");
    const langMap = { javascript: "javascript", python: "python", cpp: "cpp", c: "c", java: "java" };
    const fallbackVersions = { javascript: "18.15.0", python: "3.10.0", cpp: "10.2.0", c: "10.2.0", java: "15.0.2" };
    const runtimeStart = performance.now();
    const lang = langMap[language] || language;
    const basePayload = { language: lang, files: [{ content: code }], stdin };
    
    try {
      let res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });
      let data = await res.json();
      
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
      if (!silent) setOutput(combined + `\n\nTime: ${rt} ms`);
      return { stdout, stderr, combined, timeMs: rt };
    } catch (e) {
      if (!silent) setOutput("Error: " + e.message);
      return { stdout: "", stderr: "", combined: "", timeMs: 0, error: e };
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setVerdict("");
    setTestResults([]);
    try {
      const firstTest = question?.tests?.[0];
      if (firstTest) {
        await runCode(firstTest.in);
      } else {
        await runCode("");
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!question || !question.tests || question.tests.length === 0) {
      setVerdict("No test cases available");
      return;
    }
    
    setIsSubmitting(true);
    setOutput("");
    setVerdict("Running all test cases...");
    setTestResults([]);
    
    const results = [];
    for (const t of question.tests) {
      const { stdout, timeMs } = await runCode(t.in, { silent: true });
      const actual = normalize(stdout);
      const expected = normalize(t.out);
      results.push({ in: t.in, expected: t.out, actual: stdout, pass: actual === expected, timeMs });
    }
    
    const passed = results.filter(r => r.pass).length;
    setTestResults(results);
    
    if (passed === question.tests.length) {
      setVerdict("✅ All test cases passed! Solution accepted.");
      // Mark as completed in localStorage
      const completedQuestions = JSON.parse(localStorage.getItem('completedQuestions') || '[]');
      if (!completedQuestions.includes(questionId)) {
        completedQuestions.push(questionId);
        localStorage.setItem('completedQuestions', JSON.stringify(completedQuestions));
        setCompleted(true);
      }
    } else {
      setVerdict(`❌ ${passed}/${question.tests.length} test cases passed`);
    }
    
    setIsSubmitting(false);
  };

  const difficultyBadge = (d) => {
    const base = "px-3 py-1 text-sm font-semibold rounded-lg";
    if (d === 'Easy') return `${base} bg-green-100 text-green-700 border border-green-200`;
    if (d === 'Medium') return `${base} bg-yellow-100 text-yellow-700 border border-yellow-200`;
    if (d === 'Hard') return `${base} bg-red-100 text-red-700 border border-red-200`;
    return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex">
      {/* Left Panel - Question Details */}
      <div className="w-2/5 border-r border-gray-200 p-6 overflow-y-auto">
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/projects'}
            className="text-gray-600 hover:text-black text-sm font-semibold mb-4 flex items-center gap-1"
          >
            ← Back to Projects
          </button>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-black">{question.title}</h1>
            {completed && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                ✓ Completed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className={difficultyBadge(question.difficulty)}>{question.difficulty}</span>
            <span className="text-sm text-gray-500">ID: {question.id}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-2">Problem Statement</h3>
            <p className="text-gray-700 leading-relaxed">{question.statement}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-2">Input Format</h3>
            <p className="text-gray-700">{question.input}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-2">Output Format</h3>
            <p className="text-gray-700">{question.output}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">Sample Test Cases</h3>
            <div className="space-y-3">
              {question.tests && question.tests.map((t, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs font-bold text-gray-600 mb-2">Test Case {idx + 1}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">Input:</div>
                      <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-sm whitespace-pre-wrap">{t.in}</pre>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">Output:</div>
                      <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-sm whitespace-pre-wrap">{t.out}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-3/5 flex flex-col">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-700">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-black"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isRunning || isSubmitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isRunning || isSubmitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        <div className="flex-1 border-b border-gray-200">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="h-64 overflow-y-auto border-t border-gray-200 bg-gray-50 p-4">
          <div className="font-bold text-sm mb-2">Output</div>
          {verdict && (
            <div className={`mb-3 font-bold ${verdict.includes('✅') ? 'text-green-600' : verdict.includes('❌') ? 'text-red-600' : 'text-gray-700'}`}>
              {verdict}
            </div>
          )}
          {output && (
            <pre className="bg-white border border-gray-200 rounded-lg p-3 text-sm whitespace-pre-wrap mb-3">{output}</pre>
          )}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-sm">Test Results:</div>
              {testResults.map((r, i) => (
                <div
                  key={i}
                  className={`border rounded-lg p-3 ${r.pass ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                >
                  <div className={`font-bold text-sm mb-2 ${r.pass ? 'text-green-700' : 'text-red-700'}`}>
                    Test {i + 1}: {r.pass ? 'PASS ✓' : 'FAIL ✗'} ({r.timeMs || 0} ms)
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="font-semibold text-gray-600 mb-1">Input:</div>
                      <pre className="bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap">{r.in}</pre>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-600 mb-1">Expected:</div>
                      <pre className="bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap">{r.expected}</pre>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-600 mb-1">Actual:</div>
                      <pre className="bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap">{r.actual}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
