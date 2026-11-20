import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-[#F1EAE0] p-10 text-[#403A34]">
      <h1 className="text-2xl font-semibold">
        Bienvenue, {user?.usr_prenom} {user?.usr_nom}
      </h1>
      <p className="mt-2">Rôle : {user?.usr_role}</p>
      <button
        onClick={logout}
        className="mt-6 rounded-xl bg-[#3F3A34] px-5 py-3 text-white"
      >
        Se déconnecter
      </button>
    </main>
  );
}