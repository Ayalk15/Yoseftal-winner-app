import React, { useState, useEffect } from 'react';

// מאגר מחזורי הליגה (מקוצר לתצוגה חלקה)
const allFixtures = {
  1: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל ק"ש', time: '22/08/26' }, { id: 2, home: 'עירוני דורות טבריה', away: 'הפועל פ"ת', time: '22/08/26' }, { id: 3, home: 'הפועל י-ם', away: 'מכבי ת"א', time: '22/08/26' }, { id: 4, home: 'מכבי חיפה', away: 'הפועל ר"ג', time: '22/08/26' }, { id: 5, home: 'הפועל ב"ש', away: 'הפועל חיפה', time: '22/08/26' }, { id: 6, home: 'בית"ר י-ם', away: 'הפועל ת"א', time: '22/08/26' }, { id: 7, home: 'מכבי נתניה', away: 'בני סכנין', time: '22/08/26' }],
  2: [{ id: 1, home: 'בני סכנין', away: 'מכבי פ"ת', time: '29/08/26' }, { id: 2, home: 'מכבי נתניה', away: 'הפועל י-ם', time: '29/08/26' }, { id: 3, home: 'הפועל ת"א', away: 'מכבי חיפה', time: '29/08/26' }, { id: 4, home: 'הפועל ב"ש', away: 'הפועל ר"ג', time: '29/08/26' }, { id: 5, home: 'מכבי חיפה', away: 'מכבי ת"א', time: '29/08/26' }, { id: 6, home: 'הפועל פ"ת', away: 'בית"ר י-ם', time: '29/08/26' }, { id: 7, home: 'עירוני דורות טבריה', away: 'הפועל ק"ש', time: '29/08/26' }]
  // כאן ישבו שאר המחזורים שנוסיף בהמשך כדי לא להעמיס על הקוד עכשיו
};

const ISRAELI_TEAMS = ['מכבי ת"א', 'מכבי חיפה', 'בית"ר י-ם', 'הפועל ב"ש', 'הפועל ת"א', 'מכבי נתניה', 'הפועל חיפה', 'מכבי פ"ת', 'בני סכנין', 'עירוני דורות טבריה', 'הפועל ק"ש', 'הפועל פ"ת', 'הפועל ר"ג', 'הפועל י-ם'];

export default function App() {
  // ניהול ניווט ומצבים
  const [currentTab, setCurrentTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [tempUsername, setTempUsername] = useState('');

  // זיכרון נתונים
  const [predictions, setPredictions] = useState(() => JSON.parse(localStorage.getItem('predictions')) || {});
  const [tournament, setTournament] = useState(() => JSON.parse(localStorage.getItem('tournament')) || { champion: '', topScorer: '', topAssists: '', favoriteTeam: '' });
  const [jokers, setJokers] = useState(() => JSON.parse(localStorage.getItem('jokers')) || {});
  
  // תוספות חדשות: צ'אט והתראות מנהל
  const [chatMessages, setChatMessages] = useState(() => JSON.parse(localStorage.getItem('chatMessages')) || [
    { id: 1, sender: 'מערכת', text: 'ברוכים הבאים לליגת יוספטל! הצ' + 'אט מוכן.', time: new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [adminAlert, setAdminAlert] = useState(() => localStorage.getItem('adminAlert') || '⚽ לא לשכוח להזין ניחושים למחזור 1! המחזור ננעל בקרוב.');

  // שמירה לזיכרון
  useEffect(() => { localStorage.setItem('predictions', JSON.stringify(predictions)); }, [predictions]);
  useEffect(() => { localStorage.setItem('tournament', JSON.stringify(tournament)); }, [tournament]);
  useEffect(() => { localStorage.setItem('jokers', JSON.stringify(jokers)); }, [jokers]);
  useEffect(() => { localStorage.setItem('chatMessages', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('adminAlert', adminAlert); }, [adminAlert]);
  useEffect(() => { localStorage.setItem('username', username); }, [username]);

  const loginAsAdmin = () => {
    if (isAdminMode) { setIsAdminMode(false); }
    else {
      const pass = prompt('סיסמת מנהל:');
      if (pass === '2531') setIsAdminMode(true);
      else if (pass !== null) alert('סיסמה שגויה!');
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !username) return;
    const newMsg = {
      id: Date.now(),
      sender: username,
      text: newChatMessage,
      time: new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})
    };
    setChatMessages([...chatMessages, newMsg]);
    setNewChatMessage('');
  };

  // מסך כניסה (בחירת שם משתמש)
  if (!username) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white" style={{ direction: 'rtl' }}>
        <div className="bg-gray-900 p-8 rounded-2xl border border-yellow-500 text-center shadow-2xl max-w-sm w-full">
          <h1 className="text-3xl font-black text-yellow-500 mb-6">🏆 10 חבר'ה</h1>
          <p className="text-gray-400 mb-4 text-sm">הכנס כינוי כדי להצטרף לליגה ולצ'אט:</p>
          <input 
            type="text" 
            placeholder="איך קוראים לך?" 
            className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 text-center mb-4 focus:outline-none focus:border-yellow-500"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
          />
          <button 
            onClick={() => { if(tempUsername.trim()) setUsername(tempUsername.trim()) }} 
            className="w-full bg-yellow-500 text-gray-950 font-black py-3 rounded-xl shadow-xl hover:bg-yellow-400 transition-all">
            היכנס למשחק ⚽
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24" style={{ direction: 'rtl' }}>
      
      {/* התראת מנהל */}
      {adminAlert && (
        <div className="bg-red-900/90 text-white px-4 py-2 text-sm font-bold text-center border-b border-red-500 sticky top-0 z-50 animate-pulse">
          🚨 הודעת מנהל: {adminAlert}
        </div>
      )}

      <div className="sticky top-0 bg-gray-950/95 backdrop-blur-md pt-2 pb-2 z-40 max-w-md mx-auto px-4 border-b border-gray-800">
        <header className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-yellow-500/30">
          <h1 className="text-xl font-black text-yellow-500">🏆 ליגת יוספטל</h1>
          <div className="text-xs text-gray-400 font-bold bg-gray-800 px-2 py-1 rounded">שלום, {username}</div>
        </header>

        <nav className="flex justify-between bg-gray-900 p-1 rounded-xl mt-2 border border-gray-800 overflow-x-auto">
          {['predictions', 'tournament', 'chat', 'rules'].map((tab) => (
            <button key={tab} onClick={() => setCurrentTab(tab)} className={`px-3 py-2 mx-0.5 text-[11px] font-black rounded-lg whitespace-nowrap transition-all ${currentTab === tab ? 'bg-yellow-500 text-gray-950' : 'text-gray-400 hover:text-white'}`}>
              {tab === 'predictions' ? '⚽ משחקים' : tab === 'tournament' ? '👑 הימורים' : tab === 'chat' ? '💬 צ' + 'אט' : 'ℹ️ חוקים'}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-md mx-auto mt-4 px-4">
        
        {/* טאב משחקים (גרסה ויזואלית מינימלית לבינתיים) */}
        {currentTab === 'predictions' && (
          <div className="space-y-4">
             <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-xl font-bold border border-gray-700 focus:outline-none">
                {[...Array(2).keys()].map(i => <option key={i+1} value={i+1}>מחזור {i+1}</option>)}
             </select>
             
             {allFixtures[matchday]?.map(game => (
               <div key={game.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-lg">
                 <div className="text-[10px] text-gray-500 mb-3 text-center">{game.time}</div>
                 <div className="flex justify-between items-center font-black text-sm px-2">
                   <span className="w-2/5 text-right">{game.home}</span> 
                   <span className="w-1/5 text-center text-gray-600">VS</span> 
                   <span className="w-2/5 text-left">{game.away}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 mt-4">
                    <button className="bg-gray-800 py-2 rounded-lg border border-gray-700 font-bold hover:bg-yellow-500 hover:text-black">1</button>
                    <button className="bg-gray-800 py-2 rounded-lg border border-gray-700 font-bold hover:bg-yellow-500 hover:text-black">X</button>
                    <button className="bg-gray-800 py-2 rounded-lg border border-gray-700 font-bold hover:bg-yellow-500 hover:text-black">2</button>
                 </div>
               </div>
             ))}
             <button className="w-full bg-yellow-500 text-gray-950 font-black py-4 rounded-xl shadow-xl mt-4">💾 שמור ניחושים</button>
          </div>
        )}

        {/* טאב החוקים החדשים שביקשת */}
        {currentTab === 'rules' && (
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-5 text-sm leading-relaxed text-gray-300 shadow-xl">
             <div className="text-center pb-2 border-b border-gray-800">
               <h2 className="text-yellow-500 font-black text-xl">🎯 חוקי הליגה החדשים</h2>
             </div>
             
             <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
               <h3 className="font-bold text-white mb-2 flex items-center gap-2">⚽ ניחושי משחקים</h3>
               <p>• ניחוש כיוון (1,X,2): <span className="text-yellow-500 font-bold">2 נקודות</span>.</p>
               <p>• ניחוש תוצאה מדויקת: <span className="text-yellow-500 font-bold">6 נקודות</span> (כולל הבונוס).</p>
               <p>• <span className="text-white font-bold">🃏 חוק הג'וקר:</span> משחק שסומן מקבל כפל ניקוד.</p>
             </div>

             <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
               <h3 className="font-bold text-white mb-2 flex items-center gap-2">👑 בונוסים לעונה (לנחש עכשיו!)</h3>
               <p>• אלופת המדינה: <span className="text-yellow-500 font-bold">40 נקודות</span>.</p>
               <p className="mt-1">• מלך השערים: <span className="text-yellow-500 font-bold">30 נקודות</span>.</p>
               <p className="text-xs text-gray-500 ml-4 mb-1">+ <span className="text-white font-bold">2 נקודות</span> על כל שער שהוא מבקיע בפועל.</p>
               <p>• מלך הבישולים: <span className="text-yellow-500 font-bold">50 נקודות</span>.</p>
             </div>
          </div>
        )}

        {/* טאב צ'אט */}
        {currentTab === 'chat' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl flex flex-col h-[60vh] overflow-hidden shadow-xl">
            <div className="bg-gray-800 p-3 text-center text-xs font-bold text-gray-400 border-b border-gray-700">
              💬 חדר הלבשה - השיחות נשמרות כאן
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.sender === username ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
                  <span className="text-[10px] text-gray-500 mb-0.5 px-1">{msg.sender} • {msg.time}</span>
                  <div className={`p-3 rounded-2xl text-sm ${msg.sender === username ? 'bg-yellow-500 text-gray-950 rounded-tl-none font-medium' : 'bg-gray-800 text-white rounded-tr-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 bg-gray-950 border-t border-gray-800 flex gap-2">
              <input 
                type="text" 
                placeholder="כתוב הודעה לחבר'ה..." 
                className="flex-1 bg-gray-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border focus:border-yellow-500"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
              />
              <button type="submit" className="bg-yellow-500 text-gray-950 p-3 rounded-xl font-black">שלח</button>
            </form>
          </div>
        )}

        {/* פאנל מנהל מוצפן */}
        {isAdminMode && (
          <div className="mt-8 bg-red-950/30 border border-red-900 p-4 rounded-xl space-y-3">
            <h3 className="text-red-500 font-black text-center border-b border-red-900/50 pb-2">🛠️ אזור ניהול מערכת</h3>
            <label className="block text-xs font-bold text-gray-400">עדכון התראת מנהל קופצת:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={adminAlert} 
                onChange={(e) => setAdminAlert(e.target.value)}
                placeholder="הקלד הודעה לכולם..." 
                className="flex-1 bg-gray-900 p-2 text-sm rounded border border-gray-700 text-white"
              />
              <button onClick={() => setAdminAlert('')} className="bg-gray-700 px-3 text-xs rounded font-bold">נקה</button>
            </div>
            <p className="text-[10px] text-gray-500 text-center pt-2">עריכת תוצאות תתווסף לאחר החיבור לשרת.</p>
          </div>
        )}

      </div>

      <footer className="max-w-md mx-auto mt-8 mb-4 text-center">
        <button type="button" onClick={loginAsAdmin} className={`px-4 py-2 text-[10px] font-bold rounded-lg border transition-all ${isAdminMode ? 'bg-red-950 border-red-800 text-red-400' : 'bg-gray-900 border-gray-
