/** @jsxImportSource react */
import { collection, addDoc } from "firebase/firestore";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./Login";
import { db } from "./firebase";

function Dashboard() {
  const { user } = useAuth();

  const addTestDoc = async () => {
    await addDoc(collection(db, "transactions"), {
      user: user?.uid,
      amount: 50,
      createdAt: new Date()
    });
  };

  if (!user) return <Login />;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>You are logged in as {user.email}</p>
      <button onClick={addTestDoc}>Add Firestore Test Doc</button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

