import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  setDoc,
  deleteDoc as deleteVoteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";

interface Option {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: Option[];
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export default function Dashboard() {
  const user = auth.currentUser;

  const [polls, setPolls] = useState<Poll[]>([]);
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [expireDays, setExpireDays] = useState(1);

  const [editingPollId, setEditingPollId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editOption1, setEditOption1] = useState("");
  const [editOption2, setEditOption2] = useState("");

  /* ---------------- Load Polls ---------------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "polls"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Poll[];
      setPolls(data);
    });

    return () => unsubscribe();
  }, []);

  /* ---------------- Create Poll ---------------- */
  const createPoll = async () => {
    if (!question || !option1 || !option2) return;

    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000)
    );

    await addDoc(collection(db, "polls"), {
      question,
      options: [
        { text: option1, votes: 0 },
        { text: option2, votes: 0 },
      ],
      createdBy: user?.uid,
      createdAt: Timestamp.now(),
      expiresAt,
    });

    setQuestion("");
    setOption1("");
    setOption2("");
  };

  /* ---------------- Vote ---------------- */
  const vote = async (poll: Poll, selectedIndex: number) => {
    if (!user) return;

    const voteRef = doc(db, "polls", poll.id, "votes", user.uid);
    const voteSnap = await getDoc(voteRef);

    const updatedOptions = [...poll.options];

    if (!voteSnap.exists()) {
      updatedOptions[selectedIndex].votes += 1;
      await setDoc(voteRef, { selectedOption: selectedIndex });
    } else {
      const previousIndex = voteSnap.data().selectedOption;

      if (previousIndex === selectedIndex) {
        updatedOptions[selectedIndex].votes -= 1;
        await deleteVoteDoc(voteRef);
      } else {
        updatedOptions[previousIndex].votes -= 1;
        updatedOptions[selectedIndex].votes += 1;
        await setDoc(voteRef, { selectedOption: selectedIndex });
      }
    }

    await updateDoc(doc(db, "polls", poll.id), {
      options: updatedOptions,
    });
  };

  /* ---------------- Edit ---------------- */
  const startEdit = (poll: Poll) => {
    setEditingPollId(poll.id);
    setEditQuestion(poll.question);
    setEditOption1(poll.options[0].text);
    setEditOption2(poll.options[1].text);
  };

  const saveEdit = async (poll: Poll) => {
    await updateDoc(doc(db, "polls", poll.id), {
      question: editQuestion,
      options: [
        { text: editOption1, votes: poll.options[0].votes },
        { text: editOption2, votes: poll.options[1].votes },
      ],
    });

    setEditingPollId(null);
  };

  /* ---------------- Delete ---------------- */
  const deletePoll = async (id: string) => {
    await deleteDoc(doc(db, "polls", id));
  };

  /* ---------------- Logout ---------------- */
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white px-4 py-6">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <h1 className="text-xl md:text-2xl font-semibold text-center md:text-left">
          Welcome {user?.displayName}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link to="/media" className="w-full sm:w-auto">
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition">
              Media
            </button>
        
          </Link>
<Link to="/chat">
  <button className="bg-blue-600 px-4 py-2 rounded text-white">
    Chat
  </button>
</Link>

          <button
            onClick={logout}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition"
          >
            Logout
          </button>
        
        </div>
      </div>

      {/* CREATE POLL */}
      <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl mb-12 max-w-4xl mx-auto">
        <h2 className="text-lg md:text-xl font-semibold mb-6">
          Create New Poll
        </h2>

        <input
          placeholder="Poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
        />

        <input
          placeholder="Option 1"
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
        />

        <input
          placeholder="Option 2"
          value={option2}
          onChange={(e) => setOption2(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
        />

        <input
          type="number"
          placeholder="Expire in days"
          value={expireDays}
          onChange={(e) => setExpireDays(Number(e.target.value))}
          className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded-lg"
        />

        <button
          onClick={createPoll}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg font-semibold"
        >
          Create Poll
        </button>
      </div>

      {/* POLLS */}
      <div className="grid gap-8 max-w-4xl mx-auto">
        {polls.map((poll) => {
          const expired =
            poll.expiresAt.toDate().getTime() < Date.now();

          return (
            <div
              key={poll.id}
              className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl"
            >
              {editingPollId === poll.id ? (
                <>
                  <input
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                  <input
                    value={editOption1}
                    onChange={(e) => setEditOption1(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                  <input
                    value={editOption2}
                    onChange={(e) => setEditOption2(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                  <button
                    onClick={() => saveEdit(poll)}
                    className="px-4 py-2 bg-green-600 rounded-lg"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg md:text-xl font-semibold mb-6">
                    {poll.question} {expired && "(Expired)"}
                  </h3>

                  {poll.options.map((option, index) => (
                    <div key={index} className="mb-4">
                      <button
                        disabled={expired}
                        onClick={() => vote(poll, index)}
                        className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-blue-600 rounded-lg transition"
                      >
                        {option.text} — Votes: {option.votes}
                      </button>
                    </div>
                  ))}

                  {poll.createdBy === user?.uid && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        onClick={() => startEdit(poll)}
                        className="px-4 py-2 bg-yellow-600 rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deletePoll(poll.id)}
                        className="px-4 py-2 bg-red-600 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
