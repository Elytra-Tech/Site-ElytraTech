import { auth, db } from "./firebase.js";
import { collection, addDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

window.salvarPreviaNuvem = async function (html, resumo) {
    const ref = await addDoc(collection(db, 'previews'), {
        html,
        resumo,
        uid: auth.currentUser?.uid || null,
        email: auth.currentUser?.email || null,
        criadoEm: serverTimestamp()
    });

    return ref.id;
};