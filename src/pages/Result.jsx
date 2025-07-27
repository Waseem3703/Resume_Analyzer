import { FaLock } from "react-icons/fa6";

import { useState } from "react";

// Main App component for the AI-Powered Resume Analyzer
const App = () => {
  // State variables to manage the application's data and UI
  const [resumeText, setResumeText] = useState(""); // Stores the user's resume text (either pasted or from .txt file)
  const [jobDescription, setJobDescription] = useState(""); // Stores the job description text
  const [analysisResult, setAnalysisResult] = useState(null); // Stores the AI analysis results
  const [loadingAnalysis, setLoadingAnalysis] = useState(false); // Indicates if analysis is in progress
  const [analysisError, setAnalysisError] = useState(""); // Stores any error messages from analysis

  const [chatHistory, setChatHistory] = useState([]); // Stores the conversation history for the chatbot
  const [chatInput, setChatInput] = useState(""); // Stores the current input for the chatbot
  const [loadingChat, setLoadingChat] = useState(false); // Indicates if chatbot is processing
  const [chatError, setChatError] = useState(""); // Stores any error messages from chatbot

  const [selectedFileName, setSelectedFileName] = useState(""); // Stores the name of the selected file
  const [fileUploadError, setFileUploadError] = useState(""); // Stores file upload related errors/messages

  /**
   * Handles the file upload input change.
   * Reads .txt files directly, prompts for paste for PDF/Word.
   * @param {Event} e - The change event from the file input.
   */
  const handleFileUploadBackend = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setFileUploadError("");

    const fileType = file.type;

    if (
      fileType === "application/pdf" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const formData = new FormData();
        formData.append("resume", file);

        const response = await fetch(
          "http://localhost:5000/api/upload-resume",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (response.ok) {
          setResumeText(data.parsedText);
          setFileUploadError("✅ File parsed successfully! Text loaded below.");
        } else {
          setFileUploadError(data.error || "❌ Failed to parse file.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        setFileUploadError("❌ Error uploading file. Please try again.");
      }
    } else if (fileType === "text/plain") {
      // Keep existing text file handling
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target.result);
        setFileUploadError("✅ Text file loaded successfully.");
      };
      reader.onerror = () => {
        setFileUploadError("❌ Failed to read text file.");
        setResumeText("");
      };
      reader.readAsText(file);
    } else {
      setFileUploadError(
        "❌ Unsupported file type. Please upload .txt, .pdf, or .docx."
      );
      setResumeText("");
    }
  };

  /**
   * Handles the resume analysis process.
   * Sends resume and job description to the Gemini API for analysis.
   */
  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    setAnalysisError("");

    const prompt = `
You are an AI resume analysis tool.
Return ONLY valid JSON, no text or markdown.
JSON must have:
{
  "score": number (0-100),
  "overallFeedback": string,
  "keywordMatches": [{"keyword": string, "foundInResume": boolean}],
  "improvementSuggestions": [string]
}
All strings must be properly escaped (\\n, \\", \\\\). No extra explanation.

Resume:
"""${resumeText}"""

Job Description:
"""${jobDescription}"""
`;

    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const jsonString = result.candidates[0].content.parts[0].text;
        console.log("Raw AI response:", jsonString);

        try {
          const parsed = JSON.parse(jsonString);
          setAnalysisResult(parsed);
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError, jsonString);
          setAnalysisError(
            "❌ AI returned invalid JSON. Try using shorter text or simpler input."
          );
        }
      } else {
        setAnalysisError(
          "❌ Failed to get a valid analysis result from AI. Please try again."
        );
        console.error("AI response structure unexpected:", result);
      }
    } catch (error) {
      setAnalysisError(`❌ Error during analysis: ${error.message}`);
      console.error("Analysis API error:", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  /**
   * Handles sending a message to the AI chatbot.
   * Updates chat history and sends the conversation to Gemini API.
   */
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newUserMessage = { role: "user", parts: [{ text: chatInput }] };
    const updatedChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedChatHistory);
    setChatInput("");
    setLoadingChat(true);
    setChatError("");

    try {
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are an AI resume assistant.
Here is the resume and job description you should always use as context:

Resume:
"""${resumeText}"""

Job Description:
"""${jobDescription}"""

Now answer the user's question below based on this context:
                        `.trim(),
              },
            ],
          },
          ...updatedChatHistory,
        ],
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const aiResponseText = result.candidates[0].content.parts[0].text;
        setChatHistory((prev) => [
          ...prev,
          { role: "model", parts: [{ text: aiResponseText }] },
        ]);
      } else {
        setChatError(
          "Failed to get a response from the chatbot. Please try again."
        );
        console.error("Chatbot AI response structure unexpected:", result);
      }
    } catch (error) {
      setChatError(`Error communicating with the chatbot: ${error.message}`);
      console.error("Chatbot API error:", error);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div>
      
    {/* Input Section */}
<div className="w-full md:px-30 space-y-6"> {/* Changed space-y-10 to space-y-6 */}
  
  {/* File Upload */}
  <div className="w-full max-w-sm mx-auto text-center border border-dashed border-[#249a71] rounded-lg bg-gray-50 dark:bg-gray-800 p-6">
    <form className="space-y-4">
      <p className="text-sm text-gray-700 dark:text-white">
        Drop your resume here or click to upload.
        <br />
        <span className="text-gray-500 dark:text-gray-400">
          PDF, DOCX & TXT only. Max 2MB file size.
        </span>
      </p>

      {/* Styled Label that looks like a button */}
      <label
        htmlFor="resumeFile"
        className="inline-block bg-[#249a71] text-white font-medium px-6 py-2 rounded cursor-pointer hover:bg-green-700 transition"
      >
        Upload Your Resume
      </label>

      {/* Hidden functional input */}
      <input
        type="file"
        id="resumeFile"
        accept=".txt,.pdf,.docx"
        onChange={handleFileUploadBackend}
        className="hidden"
      />

      {selectedFileName && (
        <p className="text-sm text-green-600">Selected: {selectedFileName}</p>
      )}

      <p className="flex items-center gap-2 justify-center text-sm text-gray-600 dark:text-gray-400">
        <FaLock className="text-gray-500" />
        Privacy Protected
      </p>
    </form>
  </div>

</div>

      {/* Analyze Button */}
      <div className="flex flex-col items-center gap-4 mt-8 py-10">
        <button
          onClick={handleAnalyze}
          disabled={loadingAnalysis || !resumeText.trim()}
          className={`w-full max-w-sm px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 cursor-pointer
      ${
        loadingAnalysis || !resumeText.trim()
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
        >
          {loadingAnalysis ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <span>Analyzing...</span>
            </div>
          ) : (
            "Analyze Resume"
          )}
        </button>

        {analysisError && (
          <p className="text-red-600 text-sm text-center max-w-sm">
            {analysisError}
          </p>
        )}
      </div>

      {/* Analysis Results Section */}
      {analysisResult && (
        <div className="w-full md:px-30 mx-auto mt-10 bg-white p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Analysis Results
          </h2>

          {/* Score */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Resume Score:
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analysisResult.score}
              <span className="text-base text-gray-500 dark:text-gray-400">
                /100
              </span>
            </p>
          </div>

          {/* Overall Feedback */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Overall Feedback:
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysisResult.overallFeedback}
            </p>
          </div>

          {/* Keyword Matching */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Keyword Matching:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {analysisResult.keywordMatches &&
                analysisResult.keywordMatches.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-3 rounded-lg shadow-sm border 
          ${
            item.foundInResume
              ? "bg-green-100 dark:bg-green-900/30 border-green-400"
              : "bg-red-100 dark:bg-red-900/30 border-red-400"
          }`}
                  >
                    <span className="text-lg">
                      {item.foundInResume ? "✅" : "❌"}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {item.keyword}
                    </span>
                  </div>
                ))}
            </div>
            {(!analysisResult.keywordMatches ||
              analysisResult.keywordMatches.length === 0) && (
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No specific keywords identified for matching. Try providing a
                more detailed job description.
              </p>
            )}
          </div>

          {/* Improvement Suggestions */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Improvement Suggestions:
            </h3>

            <ul className="space-y-3">
              {analysisResult.improvementSuggestions &&
              analysisResult.improvementSuggestions.length > 0 ? (
                analysisResult.improvementSuggestions.map(
                  (suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-md shadow-sm"
                    >
                      <span className="text-yellow-500 text-lg mt-0.5">💡</span>
                      <span className="text-gray-700 dark:text-gray-200">
                        {suggestion}
                      </span>
                    </li>
                  )
                )
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No specific improvement suggestions generated. Your resume
                  might already be well-optimized!
                </p>
              )}
            </ul>

             {/* AI Chatbot Section */}
      <div className="mt-10 p-6 bg-white md:px-30">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          AI Resume Chatbot
        </h2>

        <div className="min-h-[150px] max-h-[400px] overflow-y-auto space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {chatHistory.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Start a conversation to get resume improvement suggestions!
            </p>
          )}

          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                }`}
              >
                {msg.parts.map((part, pIdx) => (
                  <p key={pIdx}>{part.text}</p>
                ))}
              </div>
            </div>
          ))}

          {loadingChat && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm">
                <svg
                  className="animate-spin h-4 w-4 text-gray-500 dark:text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 
                 0 0 5.373 0 12h4zm2 5.291A7.962 
                 7.962 0 014 12H0c0 3.042 1.135 
                 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Typing...
              </div>
            </div>
          )}
        </div>
        <form
          onSubmit={handleChatSubmit}
          className="mt-4 flex items-center gap-2"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask for resume improvement ..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={loadingChat}
          />

          <button
            type="submit"
            disabled={loadingChat || !chatInput.trim()}
            className={`px-5 py-2 rounded-lg text-white font-semibold transition-colors duration-200 ${
              loadingChat || !chatInput.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Send
          </button>
        </form>

        {chatError && <p className="text-red-600 text-sm mt-2">{chatError}</p>}
      </div>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default App;
