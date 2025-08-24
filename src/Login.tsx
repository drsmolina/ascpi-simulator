/** @jsxImportSource react */
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { user } = useAuth();

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.displayName || user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
}

