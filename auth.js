const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const iniciarBtn = document.getElementById("iniciar");

// Verifica se o usuário está logado
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("Usuário logado:", user.displayName);
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";
        iniciarBtn.disabled = false;
    } else {
        console.log("Nenhum usuário logado.");
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
        iniciarBtn.disabled = true;
    }
});

// Login com Google
loginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => {
        console.error("Erro no login:", error);
    });
});

// Logout
logoutBtn.addEventListener("click", () => {
    auth.signOut();
});
