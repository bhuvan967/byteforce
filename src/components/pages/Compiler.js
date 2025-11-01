import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import logo from './creating.jpg';

const Compiler = () => {
  const editorRef = useRef(null);
  
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState(`console.log('Hello BYTEFORCE!');`);
  const [input, setInput] = useState('');

  // Language configurations for Piston API
  const languageMap = {
    javascript: { name: 'javascript', version: '18.15.0', extension: 'js' },
    python: { name: 'python', version: '3.10.0', extension: 'py' },
    cpp: { name: 'c++', version: '10.2.0', extension: 'cpp' },
    java: { name: 'java', version: '15.0.2', extension: 'java' },
    c: { name: 'c', version: '10.2.0', extension: 'c' },
  };

  // Default code templates
  const defaultCode = {
    javascript: `// Welcome to BYTEFORCE IDE
console.log('Hello BYTEFORCE!');

// Example with user input
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Try entering input in the Input section
`,
    python: `# Welcome to BYTEFORCE IDE
print('Hello BYTEFORCE!')

# Example with user input
# Try entering input in the Input section
name = input("Enter your name: ")
print(f'Hello {name}!')
`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello BYTEFORCE!" << endl;

    // Example with user input
    string name;
    cout << "Enter your name: ";
    cin >> name;
    cout << "Hello " << name << "!" << endl;
    
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello BYTEFORCE!");
        
        // Example with user input
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter your name: ");
        String name = sc.nextLine();
        System.out.println("Hello " + name + "!");
        sc.close();
    }
}`,
    c: `#include <stdio.h>
#include <string.h>

int main() {
    printf("Hello BYTEFORCE!\\n");
    
    // Example with user input
    char name[100];
    printf("Enter your name: ");
    scanf("%s", name);
    printf("Hello %s!\\n", name);
    
    return 0;
}`,
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(defaultCode[newLang]);
    setOutput('');
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Compiling and executing...');

    const langConfig = languageMap[language];
    
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: langConfig.name,
          version: langConfig.version,
          files: [
            {
              name: `main.${langConfig.extension}`,
              content: code,
            },
          ],
          stdin: input,
        }),
      });

      const data = await response.json();
      
      if (data.run) {
        const output = data.run.stdout || data.run.stderr || 'No output';
        setOutput(output);
      } else {
        setOutput('Error: Unable to execute code');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-full px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="Skill Ignite Logo"
                  className="w-10 h-10 rounded-full"
                />
                <h1 className="text-2xl font-bold text-black">
                  BYTEFORCE IDE
                </h1>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-black">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white font-medium">Online Editor</span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-700 font-medium">Language:</label>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-white border border-gray-300 px-5 py-2.5 text-black focus:outline-none focus:border-black transition-all hover:border-gray-400 cursor-pointer"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="c">C</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-[calc(100vh-96px)]">
        {/* Editor Section */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white border border-gray-300 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="h-5 w-px bg-gray-300"></div>
              <span className="text-sm text-gray-900 font-medium">main.{languageMap[language].extension}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 border border-gray-200">
                {code.split('\n').length} lines
              </div>
            </div>
          </div>
          
          <div className="flex-1 border border-t-0 border-gray-300 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col space-y-5">
          {/* Input Section */}
          <div className="bg-white border border-gray-300 p-5">
            <label className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <div className="bg-black p-1.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span>Input (stdin)</span>
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for cin, scanf, input()..."
              className="w-full h-24 bg-white border border-gray-300 px-4 py-3 text-sm text-gray-900 font-mono focus:outline-none focus:border-black resize-none transition-all placeholder-gray-400"
            />
            <p className="text-xs text-gray-600 mt-2.5 flex items-center space-x-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Each line will be treated as separate input</span>
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white border border-gray-300 p-5">
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`w-full py-3.5 font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2.5 ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 active:scale-[0.98]'
              }`}
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Run Code</span>
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-black font-semibold bg-gray-100 px-2.5 py-1 border border-gray-200">
                {languageMap[language].version}
              </span>
            </div>
          </div>

          {/* Output Display */}
          <div className="flex-1 bg-white border border-gray-300 overflow-hidden flex flex-col">
            <div className="bg-gray-100 px-5 py-3.5 border-b border-gray-300 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="bg-black p-1.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">Output</span>
              </div>
              {output && (
                <button
                  onClick={() => setOutput('')}
                  className="text-xs text-gray-600 hover:text-gray-900 transition-colors px-3 py-1 hover:bg-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {output ? (
                <pre className="text-sm font-mono text-gray-900 whitespace-pre-wrap break-words">
                  {output}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="bg-gray-50 p-6 border border-gray-200">
                    <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium mt-4">Output will appear here</p>
                  <p className="text-xs mt-1.5 text-gray-400">Click "Run Code" to execute</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-gray-100 border border-gray-300 p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-black p-2 flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-black mb-1.5">Quick Tip</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Write your code and click "Run Code" to execute it in a secure sandbox environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;