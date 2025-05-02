import React, { useState } from 'react';
import { PromptTemplate } from '@langchain/core/prompts';
import { Ollama } from '@langchain/community/llms/ollama';

function App() {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [customResume, setCustomResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('tinyllama'); //  TinyLlama

  const handleCustomize = async () => {
    setLoading(true);
    setError('');
    
    try {
      const prompt = new PromptTemplate({
        template: `
You are a resume expert.
Rewrite the following RESUME to be highly relevant for the provided JOB DESCRIPTION.

RESUME:
{resume}

JOB DESCRIPTION:
{jd}

Customized Resume:
`,
        inputVariables: ['resume', 'jd'],
      });

      const formattedPrompt = await prompt.format({ resume, jd });
      
      // local Ollama LLM
      try {
        const ollama = new Ollama({
          baseUrl: "http://localhost:11434",
          model: model,
        });
        const response = await ollama.invoke(formattedPrompt);
        setCustomResume(response.trim());
      } catch (err) {
        throw new Error(`Ollama error: ${err.message}. Make sure Ollama is installed and running with the "${model}" model.`);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred");
      setCustomResume('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
      <h2>LangChain Resume Customizer (Ollama Edition)</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <div>Select Ollama Model:</div>
        <select 
          value={model} 
          onChange={(e) => setModel(e.target.value)}
          style={{ padding: '5px', marginBottom: '10px' }}
        >
          <option value="phi2">Phi-2 (Lightweight - 2.7GB)</option>
          <option value="gemma:2b">Gemma 2B (Ultra-Light - 1.8GB)</option>
          <option value="tinyllama">TinyLlama (Smallest - 1.1GB)</option>
          <option value="phi3:mini">Phi-3 Mini (Balanced - 3.8GB)</option>
          <option value="mistral:7b-instruct-v0.2-q4_0">Mistral Tiny (Balanced - 2.0GB)</option>
          <option value="llama2">Llama 2 (Larger - 7+GB)</option>
        </select>
        <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
          Make sure you have Ollama installed from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer">ollama.ai</a> 
          and have pulled your desired model using <code>ollama pull {model}</code>
        </div>
      </div>

      <textarea
        rows="8"
        placeholder="Paste your resume here..."
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />

      <textarea
        rows="8"
        placeholder="Paste job description here..."
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />

      <button 
        onClick={handleCustomize} 
        style={{ padding: '10px 20px' }}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Customize Resume with Ollama'}
      </button>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      <textarea
        rows="10"
        placeholder="Customized resume will appear here..."
        value={customResume}
        readOnly
        style={{ width: '100%', marginTop: '10px' }}
      />
    </div>
  );
}

export default App;
