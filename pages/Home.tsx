import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Check, AlertCircle, Copy, ArrowRight, Link as LinkIcon, AlignLeft } from 'lucide-react';
import { User } from 'firebase/auth';
import { generateCoverLetter } from '../services/geminiService';

interface HomeProps {
  user: User | null;
  onOpenAuth: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onOpenAuth }) => {
  // Job Details State
  const [jobInputType, setJobInputType] = useState<'url' | 'text'>('url');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  // Resume State
  const [resumeFile, setResumeFile] = useState<{data: string, mimeType: string} | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (!result) return;
        
        // result is roughly "data:application/pdf;base64,JVBERi0xLjQK..."
        const [header, base64Data] = result.split(',');
        // Extract mimeType from header if possible, otherwise use file.type
        const mimeType = header.match(/:(.*?);/)?.[1] || file.type;

        setResumeFile({
            data: base64Data,
            mimeType: mimeType
        });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (jobInputType === 'url' && !jobUrl.trim()) {
      setError("Please enter a job post URL.");
      return;
    }
    if (jobInputType === 'text' && !jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }
    if (!resumeFile) {
      setError("Please upload a resume (PDF or Word).");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedLetter('');

    try {
      const letter = await generateCoverLetter({
        jobUrl: jobInputType === 'url' ? jobUrl : undefined,
        jobDescription: jobInputType === 'text' ? jobDescription : undefined,
        resumeFile: resumeFile
      });
      setGeneratedLetter(letter);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
          Win the job with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">AYINESS</span>
        </h1>
        <p className="text-xl text-gh-muted max-w-2xl mx-auto">
          Generate tailored cover letters in seconds using Google Gemini AI. Track your applications with a developer-focused Kanban board.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-gh-card border border-gh-border rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="text-gh-blue" />
              Job Details
            </h2>
            
            <div className="space-y-4">
              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gh-muted mb-2">
                  Upload Resume (PDF, DOCX)
                </label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gh-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gh-blue hover:bg-gh-bg transition-all group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  />
                  {fileName ? (
                      <div className="flex items-center gap-2 text-gh-green">
                          <Check size={20} />
                          <span className="font-medium text-sm truncate max-w-[200px]">{fileName}</span>
                      </div>
                  ) : (
                      <>
                        <Upload className="w-8 h-8 text-gh-muted group-hover:text-gh-blue mb-2" />
                        <span className="text-sm text-gh-muted group-hover:text-gh-text">Click to upload (PDF/Word)</span>
                      </>
                  )}
                </div>
              </div>

              {/* Job Info Tabs */}
              <div>
                <div className="flex items-center gap-1 bg-gh-bg border border-gh-border p-1 rounded-lg mb-3">
                    <button
                        onClick={() => setJobInputType('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            jobInputType === 'url' 
                            ? 'bg-gh-border text-gh-text shadow-sm' 
                            : 'text-gh-muted hover:text-gh-text'
                        }`}
                    >
                        <LinkIcon size={14} />
                        Link to Job
                    </button>
                    <button
                        onClick={() => setJobInputType('text')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            jobInputType === 'text' 
                            ? 'bg-gh-border text-gh-text shadow-sm' 
                            : 'text-gh-muted hover:text-gh-text'
                        }`}
                    >
                        <AlignLeft size={14} />
                        Paste Description
                    </button>
                </div>

                {jobInputType === 'url' ? (
                     <div>
                        <input
                            type="url"
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                            placeholder="https://linkedin.com/jobs/..."
                            className="w-full bg-gh-bg border border-gh-border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gh-blue focus:border-transparent outline-none"
                        />
                     </div>
                ) : (
                    <div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            className="w-full h-40 bg-gh-bg border border-gh-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-gh-blue focus:border-transparent outline-none resize-none"
                        />
                    </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-900/50">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                    isGenerating ? 'bg-gh-border cursor-not-allowed' : 'bg-gh-green hover:bg-gh-greenHover'
                }`}
              >
                {isGenerating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                    </>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Generate Cover Letter
                    </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-gh-card border border-gh-border rounded-xl p-6 shadow-lg flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="text-gh-blue">AI</span> Output
            </h2>
            {generatedLetter && (
                <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gh-border rounded-md text-gh-muted hover:text-gh-text transition-colors"
                    title="Copy to clipboard"
                >
                    <Copy size={18} />
                </button>
            )}
          </div>
          
          <div className="flex-1 bg-gh-bg border border-gh-border rounded-lg p-4 font-mono text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap">
            {generatedLetter ? (
                generatedLetter
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gh-muted opacity-50">
                    <ArrowRight className="w-12 h-12 mb-4" />
                    <p>Your generated cover letter will appear here.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;