import React, { useState, useEffect } from 'react';
import { allFixtures, ISRAELI_TEAMS } from './data.js';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push } from "firebase/database";

<script type="module">
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyAcDEs7oGT_1i_J_R2789VBwgsyMYzEbhw",
authDomain: "yoseftalleague.firebaseapp.com",
databaseURL: "https://yoseftalleague-default-rtdb.firebaseio.com",
projectId: "yoseftalleague",
storageBucket: "yoseftalleague.firebasestorage.app",
messagingSenderId: "128640724900",
appId: "1:128640724900:web:4074c61bfbc8588a70db31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
</script>

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yoseftalleague.firebaseapp.com",
  databaseURL: "https://yoseftalleague-default-rtdb.firebaseio.com/",
  projectId: "yoseftalleague",
  storageBucket: "yoseftalleague.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function App() {
  const [tab, setTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [tempUser, setTempUser] = useState('');
  
  // נתונים שיגיעו מהענן
  const [preds, setPreds] = useState({});
  const [actualScores, setActualScores] = useState({});
  const [chat, setChat] = useState([]);

  // טעינת נתונים בזמן אמת מה-Firebase
  useEffect(() => {
    onValue(ref(db, 'preds'), (snapshot) => { if(snapshot.exists()) setPreds(snapshot.val()); });
    onValue(ref(db, 'actualScores'), (snapshot) => { if(snapshot.exists()) setActualScores(snapshot.val()); });
    onValue(ref(db, 'chat'), (snapshot) => { if(snapshot.exists()) setChat(Object.values(snapshot.val())); });
  }, []);

  const savePred = (md, id, data) => set(ref(db, `preds/${md}-${id}-${username}`), data);
  const sendChat = (text) => push(ref(db, 'chat'), { sender: username, text, time: new Date().toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}) });

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4 text-white">
        <div className="bg-gray-900 p-8 rounded-2xl border border-yellow-500 text-center w-full max-w-sm">
          <h1 className="text-2xl font-black text-yellow-500 mb-4">🏆 יוספטל - ענן</h1>
          <input type="text" placeholder="שם משתמש..." className="w-full bg-gray-800 p-3 rounded-lg text-white text-center mb-4" value={tempUser} onChange={(e) => setTempUser(e.target.value)} />
          <button onClick={() => { if(tempUser.trim()) setUsername(tempUser.trim()) }} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl">היכנס</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24" style={{ direction: 'rtl' }}>
      <header className="bg-gray-900 p-4 border-b border-gray-800 text-center">
        <h1 className="font-black text-yellow-500">🏆 ליגת יוספטל המקושרת</h1>
      </header>
      
      <div className="p-4 max-w-md mx-auto">
        <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg mb-4 text-white font-bold border border-gray-700">
           {[...Array(36).keys()].map(i => <option key={i+1} value={i+1}>מחזור {i+1}</option>)}
        </select>

        {allFixtures[matchday]?.map(g => {
            const p = preds[`${matchday}-${g.id}-${username}`] || {h:0, a:0, winner:'X'};
            return (
              <div key={g.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-4">
                <div className="flex justify-between font-black text-sm mb-3"><span>{g.home}</span><span>VS</span><span>{g.away}</span></div>
                <div className="flex justify-center gap-4 mb-4">
                    <button onClick={()=>savePred(matchday, g.id, {...p, a: p.a+1})}>+</button>
                    <span>{p.a} : {p.h}</span>
                    <button onClick={()=>savePred(matchday, g.id, {...p, h: p.h+1})}>+</button>
                </div>
              </div>
            )
        })}
      </div>
    </div>
  );
}
