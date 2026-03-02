import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function handleRegister() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name
    });

    await user.reload(); // 🔥 important

    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      createdAt: new Date()
    });

  } catch (error: any) {
    alert(error.message);
  }
}


  return (
    <div style={{ padding: "40px" }}>
      <h2>Welcome to NFT Weingarten </h2>

      <input
        type="text"
        placeholder="Name (for registration)"
        value={name}
        onChange={(e) => setName(e.target.value)}
         className="w-full p-3 mb-4 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
         className="w-full p-3 mb-4 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
         className="w-full p-3 mb-4 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>

      <button
        onClick={handleRegister}
        style={{ marginLeft: "10px" }}
      >
        Register
      </button>
    </div>
  );
}

export default Login;
