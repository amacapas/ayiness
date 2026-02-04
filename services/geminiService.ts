import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateParams {
  jobDescription?: string;
  jobUrl?: string;
  resumeText?: string;
  resumeFile?: {
    mimeType: string;
    data: string;
  };
  additionalInstructions?: string;
}

export const generateCoverLetter = async ({ 
  jobDescription, 
  jobUrl, 
  resumeText, 
  resumeFile, 
  additionalInstructions 
}: GenerateParams): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("Missing Gemini API Key. Please set process.env.API_KEY");
  }

  const parts: any[] = [];
  
  let textPrompt = `
    You are an expert career coach and technical writer.
    Your task is to write a compelling, professional, and GitHub-flavored markdown cover letter.
  `;

  if (jobUrl) {
    textPrompt += `\n\nTARGET JOB LINK: ${jobUrl}\n(Please use the information from this job post if you can access it, otherwise infer from the context or ask for details.)`;
  } else if (jobDescription) {
    textPrompt += `\n\nJOB DESCRIPTION:\n${jobDescription}`;
  }

  if (resumeText) {
    textPrompt += `\n\nRESUME CONTENT:\n${resumeText}`;
  } else if (resumeFile) {
    textPrompt += `\n\nRESUME: (See attached file)`;
  }

  textPrompt += `\n\nADDITIONAL INSTRUCTIONS:\n${additionalInstructions || "None"}`;
  
  textPrompt += `\n\nFocus on matching the candidate's skills from the resume to the requirements in the job description.
    Keep the tone professional yet enthusiastic.
    Format the output in clean Markdown.`;

  parts.push({ text: textPrompt });

  if (resumeFile) {
    parts.push({
      inlineData: {
        mimeType: resumeFile.mimeType,
        data: resumeFile.data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate cover letter. Ensure the file type is supported (PDF is best) and try again.");
  }
};