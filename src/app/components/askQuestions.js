"use client";
import { useState, useEffect, useRef } from "react";

const MediaInput = ({ questions, setIsInterviewStarted }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedResponses, setRecordedResponses] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const convertSpeechToText = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
        const response = await fetch("https://llm-api-8yhu.onrender.com/convert-speech", {
            method: "POST",
            body: formData,
        });

        const text = await response.text(); // Get raw response
        console.log("Raw API Response:", text);

        const data = JSON.parse(text);
        return data.text || "[Could not transcribe]";
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return "[Error in transcription]";
    }
};

  const startRecording = () => {
    if (!mediaStream) return;
    const recorder = new MediaRecorder(mediaStream);
    let blobs = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        blobs.push(event.data);
      }
    };

    recorder.onstop = () => {
      setRecordedResponses((prev) => [
        ...prev,
        { question: questions[currentQuestionIndex], response: blobs },
      ]);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleNextQuestion = () => {
    stopRecording();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      console.log("Interview completed. Responses:", recordedResponses);
      handleExitInterview();
    }
  };

  const handleExitInterview = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setIsInterviewStarted(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Interview Question</h2>
      <div className="text-lg mb-6 p-4 bg-gray-100 rounded-lg">
        {questions[currentQuestionIndex] || "No more questions."}
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-64 mb-4 rounded-lg shadow-md"
      ></video>
      <div className="flex justify-center gap-4 mt-4">
        <button
          className={`px-4 py-2 rounded text-white transition duration-300 ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Answer"}
        </button>
        <button
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          onClick={handleNextQuestion}
        >
          {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"}
        </button>
        <button
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          onClick={handleExitInterview}
        >
          Exit Interview
        </button>
      </div>
    </div>
  );
};

export default MediaInput;
