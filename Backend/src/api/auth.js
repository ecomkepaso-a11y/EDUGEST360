const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export async function loginRequest(login, password) {
  let response;

  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
  } catch {
    throw new Error("Impossible de joindre le serveur. Réessayez plus tard.");
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // 400 validation errors come as { errors: [...] }, others as { message }
    throw new Error(
      body?.errors?.[0]?.message || body?.message || "Échec de la connexion."
    );
  }

  return body.data; // { token, utilisateur }
}