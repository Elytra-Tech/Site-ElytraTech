import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIzNvP8D74h5pSDVN9fQHO100s6UW6eZk",
  authDomain: "elytratech-7832b.firebaseapp.com",
  projectId: "elytratech-7832b",
  storageBucket: "elytratech-7832b.firebasestorage.app",
  messagingSenderId: "118137470045",
  appId: "1:118137470045:web:549eff380a86064a11e1b4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function traduzErro(code) {
  const erros = {
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente em alguns minutos.",
    "auth/network-request-failed": "Erro de conexão."
  };
  return erros[code] || "Ocorreu um erro. Tente novamente.";
}