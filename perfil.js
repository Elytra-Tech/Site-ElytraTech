import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut, updateProfile }
    from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { doc, getDoc, setDoc }
    from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const $ = (seletor) => document.querySelector(seletor);

const btnAvatar = $('#btn-avatar');
const painel = $('#painel-usuario');
const modal = $('#modal-perfil');
const form = $('#form-perfil');
const msg = $('#perfil-msg');

let usuarioAtual = null;
let perfil = { usuario: '', telefone: '', foto: '' };
// undefined = foto não mudou | '' = remover foto | texto = nova foto
let fotoNova;

/* ---------- Avatar ---------- */

function desenharAvatar(elemento, foto, letra) {
    elemento.replaceChildren();

    if (foto) {
        const img = document.createElement('img');
        img.src = foto;
        img.alt = '';
        elemento.appendChild(img);
    } else {
        elemento.textContent = letra;
    }
}

function nomeExibido() {
    if (perfil.usuario) return perfil.usuario;
    return usuarioAtual?.email ? usuarioAtual.email.split('@')[0] : 'Usuário';
}

function atualizarUI() {
    if (!usuarioAtual) return;

    const nome = nomeExibido();
    const letra = nome.charAt(0).toUpperCase();

    desenharAvatar($('#avatar-topo'), perfil.foto, letra);
    desenharAvatar($('#avatar-painel'), perfil.foto, letra);

    $('#user-nome').textContent = nome;
    $('#user-email').textContent = usuarioAtual.email || '';
    btnAvatar.setAttribute('aria-label', 'Conta de ' + nome);
}

/* ---------- Estado do login ---------- */

onAuthStateChanged(auth, async (user) => {
    usuarioAtual = user;
    document.body.classList.toggle('logado', !!user);

    if (!user) {
        perfil = { usuario: '', telefone: '', foto: '' };
        fecharPainel();
        fecharModal();
        return;
    }

    perfil = { usuario: user.displayName || '', telefone: '', foto: '' };
    atualizarUI();

    try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) perfil = { ...perfil, ...snap.data() };
    } catch (erro) {
        console.error('Erro ao carregar perfil:', erro);
    }

    atualizarUI();
});

/* ---------- Menu do avatar ---------- */

function fecharPainel() {
    painel.hidden = true;
    btnAvatar.setAttribute('aria-expanded', 'false');
}

btnAvatar.addEventListener('click', () => {
    const abrir = painel.hidden;
    painel.hidden = !abrir;
    btnAvatar.setAttribute('aria-expanded', String(abrir));
});

document.addEventListener('click', (evento) => {
    if (!evento.target.closest('.user-menu')) fecharPainel();
});

$('#btn-sair').addEventListener('click', async () => {
    fecharPainel();
    await signOut(auth);
});

/* ---------- Modal: editar perfil ---------- */

function mostrarMsg(texto, tipo) {
    msg.textContent = texto;
    msg.className = 'perfil-msg ' + (tipo || '');
}

function previaFoto() {
    const foto = fotoNova === undefined ? perfil.foto : fotoNova;
    desenharAvatar($('#avatar-edicao'), foto, nomeExibido().charAt(0).toUpperCase());
}

function abrirModal() {
    fecharPainel();
    fotoNova = undefined;
    $('#input-foto').value = '';

    $('#perfil-usuario').value = perfil.usuario || nomeExibido();
    $('#perfil-telefone').value = perfil.telefone || '';
    $('#perfil-email').value = usuarioAtual.email || '';

    mostrarMsg('', '');
    previaFoto();
    modal.hidden = false;
    $('#perfil-usuario').focus();
}

function fecharModal() {
    modal.hidden = true;
}

$('#btn-editar-perfil').addEventListener('click', abrirModal);
$('#btn-cancelar-perfil').addEventListener('click', fecharModal);

modal.addEventListener('click', (evento) => {
    if (evento.target === modal) fecharModal();
});

document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    if (!modal.hidden) fecharModal();
    fecharPainel();
});

/* ---------- Foto: reduz e corta em quadrado ---------- */

function redimensionar(arquivo, tamanho = 256) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(arquivo);
        const img = new Image();

        img.onload = () => {
            const lado = Math.min(img.width, img.height);
            const sx = (img.width - lado) / 2;
            const sy = (img.height - lado) / 2;

            const canvas = document.createElement('canvas');
            canvas.width = tamanho;
            canvas.height = tamanho;
            canvas.getContext('2d').drawImage(img, sx, sy, lado, lado, 0, 0, tamanho, tamanho);

            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Imagem inválida'));
        };

        img.src = url;
    });
}

$('#input-foto').addEventListener('change', async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
        mostrarMsg('Escolha um arquivo de imagem.', 'erro');
        return;
    }

    if (arquivo.size > 10 * 1024 * 1024) {
        mostrarMsg('A imagem precisa ter no máximo 10 MB.', 'erro');
        return;
    }

    try {
        fotoNova = await redimensionar(arquivo);
        mostrarMsg('', '');
        previaFoto();
    } catch {
        mostrarMsg('Não foi possível ler essa imagem.', 'erro');
    }
});

$('#btn-remover-foto').addEventListener('click', () => {
    fotoNova = '';
    $('#input-foto').value = '';
    previaFoto();
});

/* ---------- Salvar ---------- */

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const usuario = $('#perfil-usuario').value.trim();
    const telefone = $('#perfil-telefone').value.replace(/\D/g, '');

    if (!usuario) {
        mostrarMsg('Digite um nome de usuário.', 'erro');
        return;
    }

    const botao = $('#btn-salvar-perfil');
    botao.disabled = true;

    try {
        const dados = { usuario, telefone };
        if (fotoNova !== undefined) dados.foto = fotoNova;

        await setDoc(doc(db, 'users', usuarioAtual.uid), dados, { merge: true });

        if (usuario !== usuarioAtual.displayName) {
            await updateProfile(usuarioAtual, { displayName: usuario });
        }

        perfil = { ...perfil, ...dados };
        atualizarUI();
        fecharModal();
    } catch (erro) {
        console.error('Erro ao salvar perfil:', erro);
        mostrarMsg('Não foi possível salvar. Tente novamente.', 'erro');
    } finally {
        botao.disabled = false;
    }
});