// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7KKjZ0D_3gKhKcfbvsrBsxsxd6k-hClg",
  authDomain: "event-form-b6e71.firebaseapp.com",
  projectId: "event-form-b6e71",
  storageBucket: "event-form-b6e71.firebasestorage.app",
  messagingSenderId: "678204577484",
  appId: "1:678204577484:web:c1f795eca375153d2e5469",
  measurementId: "G-LWXQ70DFGB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics only runs in the browser (fails in Node/API routes)
if (typeof window !== "undefined") {
  getAnalytics(app);
}
const db = getFirestore(app);

export { app, db };