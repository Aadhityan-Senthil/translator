import { useState, useRef } from "react";

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [translatedAudioUrl, setTranslatedAudioUrl] = useState<string | null>(null);
  const [lang, setLang] = useState("hi");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(audioBlob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleTranslate = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("lang", lang);

    const res = await fetch("/api/translate", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    setTranslatedAudioUrl(URL.createObjectURL(blob));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🎤 Speech Translator</h1>
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="hi">Hindi</option>
        <option value="ta">Tamil</option>
        <option value="te">Telugu</option>
        <option value="bn">Bengali</option>
      </select>
      <div style={{ marginTop: 16 }}>
        {recording ? (
          <button onClick={stopRecording}>🛑 Stop</button>
        ) : (
          <button onClick={startRecording}>🎙️ Start Recording</button>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={handleTranslate} disabled={!audioBlob}>🌍 Translate</button>
      </div>
      {translatedAudioUrl && (
        <audio controls src={translatedAudioUrl} style={{ marginTop: 16 }} />
      )}
    </div>
  );
}
