import { auth, db } from "./firebase.js";
import { collection, addDoc, doc, getDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

window.salvarPreviaNuvem = async function (html, resumo, canvasStyle = null) {
    const ref = await addDoc(collection(db, 'previews'), {
        html,
        resumo,
        canvasStyle,
        uid: auth.currentUser?.uid || null,
        email: auth.currentUser?.email || null,
        nome: auth.currentUser?.displayName || null,
        criadoEm: serverTimestamp()
    });

    return ref.id;
};

window.carregarPreviaNuvem = async function (id) {
    const snap = await getDoc(doc(db, 'previews', id));
    return snap.exists() ? snap.data() : null;
};

window.dispatchEvent(new CustomEvent('previa-nuvem-ready'));