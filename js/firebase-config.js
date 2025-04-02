const firebaseConfig = {
  apiKey: "AIzaSyDv4ktKY_b92u_RPftkWOhn2_NIfVHrYio",
  authDomain: "contador-namoro.firebaseapp.com",
  projectId: "contador-namoro",
  storageBucket: "contador-namoro.appspot.com",
  messagingSenderId: "163305528863",
  appId: "1:163305528863:web:b75bb059dfc75cd12a3f2a",
  measurementId: "G-10HDPK9430"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Exporta serviços do Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();