// src/pages/Resultats.jsx
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Resultats() {
  const [searchParams] = useSearchParams();
  const nom = searchParams.get("nom");
  const score = searchParams.get("score");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100">
      <h1 className="text-3xl font-bold mb-4">🎉 Bravo {nom} !</h1>
      <p className="text-xl mb-4">Votre score : {score}</p>
      <button
        onClick={() => navigate("/")}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Rejouer 🔁
      </button>
    </div>
  );
}
