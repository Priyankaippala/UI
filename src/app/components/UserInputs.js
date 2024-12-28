"use client";

import { useState } from "react";
import { resolve } from "styled-jsx/css";

const ResumeUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [job_description, setJobDescription] = useState("");
  const [knowledgeDomain, setKnowledgeDomain] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleBrowseClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please upload a resume.");
      return;
    }

    setIsUploading(true);

    try {

      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(selectedFile); 
      });


      const payload = {
        resume_summary: selectedFile,
        job_description,
      };

      console.log(payload);

      const response = await fetch("https://llm-api-8yhu.onrender.com/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to upload data.");
      }

      const result = await response.json();
      alert("Data uploaded successfully!");
      console.log(result);
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6 relative">
          <h1 className="text-2xl font-bold text-indigo-600 mb-4">AceAI</h1>
          <h2 className="text-xl font-semibold mb-6">Start Your Next Interview</h2>

          <form onSubmit={handleSubmit}>
            {/* Resume Upload Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Resume</h3>
              <p className="text-sm text-gray-500 mb-2">Upload your resume (pdf)</p>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  {selectedFile ? selectedFile.name : "Drag & Drop File"}
                </span>
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 transition"
                >
                  Browse File
                </button>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Job Description Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Job Description</h3>
              <p className="text-sm text-gray-500 mb-2">Add Description</p>
              <textarea
                placeholder="Add job description"
                value={job_description}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              ></textarea>
            </div>

            {/* Knowledge Domain Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Mention Knowledge Domain (Specialization)</h3>
              <p className="text-sm text-gray-500 mb-2">Optional</p>
              <input
                type="text"
                placeholder="E.g., AI, ML, Web Dev"
                value={knowledgeDomain}
                onChange={(e) => setKnowledgeDomain(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading}
              className={`${
                isUploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
              } text-white py-2 px-4 rounded-md transition w-full`}
            >
              {isUploading ? "Uploading..." : "Launch"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
