import { useState, useEffect } from "react";
export default function editor() {
    const defaultText = `შენ ხარ პროფესიონალი ვებ-ანალიტიკოსი... (შენი სრული ტექსტი)`;

  const [aiPrompt, setAiPrompt] = useState('');

  // კომპონენტის ჩატვირთვისას ამოვიღოთ შენახული ტექსტი
  useEffect(() => {
    const saved = localStorage.getItem('ai_prompt_template');
    setAiPrompt(saved || defaultText);
  }, []);

  const saveToLocal = () => {
    localStorage.setItem('ai_prompt_template', aiPrompt);
    alert('პრომპტი წარმატებით შეინახა!');
  };
  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h3>პრომპტის რედაქტორი</h3>
      <textarea
        style={{
          width: "100%",
          height: "400px",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
      />
      <button
        onClick={saveToLocal}
        style={{
          marginTop: "10px",
          padding: "10px 25px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        შენახვა (Save)
      </button>
    </div>
  );
}
