import React, { useState } from 'react';
import { generateMemeImage } from '../services/geminiService';

export const MemeBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Image = await generateMemeImage(prompt);
      setGeneratedImage(base64Image);
    } catch (err: any) {
      setError(err.message || "Failed to generate meme. Make sure you selected a paid API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-sand-200 p-3 border border-sand-400 rounded text-sm text-sand-800">
        <p>Powered by <strong>Nano Banana Pro</strong> (Gemini 3 Pro Image). Creates viral-style memes from your text.</p>
        <p className="text-xs mt-1 opacity-75">* Requires API Key selection</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-sand-700">Meme Concept</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A dog realizing it's Monday..."
          className="w-full h-20 p-2 bg-white border-2 border-sand-400 focus:border-ocean-500 outline-none resize-none font-sans"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className={`px-4 py-3 font-bold uppercase tracking-widest border-2 border-sand-900 shadow-[4px_4px_0_#71543d] transition-all
          ${loading || !prompt.trim() 
            ? 'bg-sand-400 text-sand-600 cursor-not-allowed shadow-none translate-y-1' 
            : 'bg-ocean-500 text-white hover:bg-ocean-300 active:translate-y-1 active:shadow-none'
          }`}
      >
        {loading ? "Brewing Meme..." : "Generate Meme"}
      </button>

      {error && (
        <div className="p-2 bg-red-100 border border-red-300 text-red-700 text-xs">
          {error}
        </div>
      )}

      <div className="min-h-[200px] border-2 border-dashed border-sand-400 flex items-center justify-center bg-sand-200/50 mt-2 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {generatedImage ? (
          <img src={generatedImage} alt="Generated Meme" className="max-w-full max-h-[300px] object-contain shadow-lg" />
        ) : (
          !loading && <span className="text-sand-500 text-sm italic">Result will appear here</span>
        )}
      </div>
      
      {generatedImage && (
        <a 
          href={generatedImage} 
          download={`surf-meme-${Date.now()}.png`}
          className="text-center text-xs text-ocean-700 underline hover:text-ocean-500"
        >
          Download Image
        </a>
      )}
    </div>
  );
};
