import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface Message {
  id: string;
  text: string;
  uid: string;
  username: string;
  createdAt: any;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "chats", "teamChat", "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    await addDoc(
      collection(db, "chats", "teamChat", "messages"),
      {
        text: input,
        uid: user.uid,
        username: user.displayName || "Player",
        createdAt: serverTimestamp()
      }
    );

    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚽ Team Chat</h2>

      <div style={{
        border: "1px solid gray",
        height: "400px",
        overflowY: "scroll",
        padding: "10px",
        marginBottom: "10px"
      }}>
        {messages.map((msg) => (
          <div key={msg.id}
            style={{
              textAlign: msg.uid === user?.uid ? "right" : "left",
              marginBottom: "10px"
            }}
          >
            <strong>{msg.username}</strong>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
        style={{ width: "80%" }}
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
