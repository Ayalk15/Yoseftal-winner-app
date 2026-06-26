import React, { useState, useEffect } from 'react';
import { allFixtures, ISRAELI_TEAMS } from './data.js';

export default function App() {
  const [tab, setTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [tempUser, setTempUser] = useState('');
  
  // נתוני מערכת
  const [preds, setPreds] = useState(() => JSON.parse(localStorage.getItem('preds')) || {});
  const [tourney, setTourney] = useState(() => JSON.parse(localStorage.getItem('tourney')) || { champion: '', topScorer: '', topAssists: '', favoriteTeam: '' });
  const [jokers, setJokers] = useState(() => JSON.parse(localStorage.getItem('jokers')) || {});
  const [actualScores, setActualScores] = useState(() => JSON.parse(localStorage.getItem('actualScores')) || {});
  const [chat, setChat] = useState(() => JSON.parse(localStorage.getItem('chat')) || [{ id: 1, sender: 'מערכת', text: 'ברוכים הבאים לליגת יוספטל!', time: '12:00' }]);
  const [newMsg, setNewMsg] = useState('');
  
  // פאנל ניהול
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAlert, setAdminAlert] = useState(() => localStorage.getItem('adminAlert') || '⚽ ברוכים הבאים למערכת! הכניסו ניחושים למחזור 1.');

  useEffect(() => { localStorage.setItem('preds', JSON.stringify(preds)); }, [preds]);
  useEffect(() => { localStorage.setItem('tourney', JSON.stringify(tourney)); }, [tourney]);
  useEffect(() => { localStorage.setItem('jokers', JSON.stringify(jokers)); }, [jokers]);
  useEffect(() => { localStorage.setItem('actualScores', JSON.stringify(actualScores)); }, [actualScores]);
  useEffect(() => { localStorage.setItem('chat', JSON.stringify(chat)); }, [chat]);
  useEffect(() => { localStorage.setItem('username', username); }, [username]);
  useEffect(() => { localStorage.setItem('adminAlert', adminAlert); }, [adminAlert]);

  // פונקציית חישוב נקודות
  const calculatePoints = () => {
    let pts = 0;
    Object.keys(actualScores).forEach(key => {
      const actual = actualScores[key];
      const pred = preds[key];
      if (actual && actual.isFinished && pred) {
        const [md, gameId] = key.split('-');
        let matchPts = 0;
        if (pred.winner === actual.winner) {
          matchPts += 2;
          if (Number(pred.h) === Number(actual.homeScore) && Number(pred.a) === Number(actual.awayScore)) matchPts += 4;
        }
        if (jokers[md] && String(jokers[md]) === String(gameId)) matchPts *= 2;
        pts += matchPts;
      }
    });
    return pts;
  };

  const totalPoints = calculatePoints();

  const handleAdminLogin = () => {
    if (isAdmin) setIsAdmin(false);
    else if (prompt('סיסמת מנהל:') === '2531') setIsAdmin(true);
    else alert('שגיאה: סיסמה לא נכונה');
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4 text-white" style={{ direction: 'rtl' }}>
        <div className="bg-gray-900 p-8 rounded-2xl border border-yellow-500 text-center max-w-sm w-full">
          <h1 className="text-3xl font-black text-yellow-500 mb-6">🏆 יוספטל</h1>
          <input type="text" placeholder="איך קוראים לך?" className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 text-center mb-4 focus:outline-none" value={tempUser} onChange={(e) => setTempUser(e.target.value)} />
          <button onClick={() => { if(tempUser.trim()) setUsername(tempUser.trim()) }} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl">כניסה לליגה</button>
        </div>
      </div>
    );
  }

  const handlePredict = (id, val) => setPreds(p => ({ ...p, [`${matchday}-${id}`]: { ...(p[`${matchday}-${id}`] || {h:0, a:0}), winner: val } }));
  const handleScore = (id, type, d) => {
    setPreds(p => {
      const c = p[`${matchday}-${id}`] || { winner: '', h: 0, a: 0 };
      let n = c[type] + d; if (n < 0) n = 0;
      const u = { ...c, [type]: n };
      u.winner = u.h > u.a ? '1' : u.h < u.a ? '2' : 'X';
      return { ...p, [`${matchday}-${id}`]: u };
    });
  };

  const sendChat = (e) => {
    e.preventDefault();
    if(!newMsg.trim()) return;
    setChat([...chat, { id: Date.now(), sender: username, text: newMsg, time: new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}) }]);
    setNewMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24" style={{ direction: 'rtl' }}>
      
      {adminAlert && (
        <div className="bg-red-900/90 text-white px-4 py-2 text-sm font-bold text-center border-b border-red-500 sticky top-0 z-50">
          🚨 מנהל הליגה: {adminAlert}
        </div>
      )}

      <header className="sticky top-0 bg-gray-950/95 pt-2 pb-3 z-40 max-w-md mx-auto px-2 border-b border-gray-900/50">
        <div className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border-b border-yellow-500/30">
          <h1 className="text-xl font-extrabold text-yellow-500">🏆 10 חבר'ה</h1>
          <div className="bg-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700 text-white">👤 {username}</div>
        </div>
        <nav className="flex justify-between bg-gray-900 p-2 rounded-xl mt-2 border border-gray-800 overflow-x-auto text-[11px] font-black">
          {['predictions', 'tournament', 'leaderboard', 'chat', 'rules'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 mx-0.5 rounded-lg whitespace-nowrap transition-colors ${tab===t?'bg-yellow-500 text-black':'text-gray-400'}`}>
              {t==='predictions'?'⚽ משחקים':t==='tournament'?'👑 הימורים':t==='leaderboard'?'📊 טבלה':t==='chat'?'💬 צ\'אט':'ℹ️ חוקים'}
            </button>
          ))}
        </nav>
      </header>

      <div className="p-4 max-w-md mx-auto">
        {tab === 'predictions' && (
          <div className="space-y-4">
            <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none">
              {[...Array(36).keys()].map(i => <option key={i+1} value={i+1}>מחזור {i+1}</option>)}
            </select>
            
            {allFixtures[matchday]?.map(g => {
              const p = preds[`${matchday}-${g.id}`] || {winner:'', h:0, a:0};
              const j = jokers[matchday] === g.id;
              return (
                <div key={g.id} className={`bg-gray-900 p-4 rounded-xl border shadow-md ${j?'border-yellow-500 bg-gradient-to-br from-gray-900 to-amber-950/30':'border-gray-800'}`}>
                  <div className="text-[10px] text-gray-500 mb-2 flex justify-between">
                    <span>{g.time}</span>
                    <button onClick={()=>setJokers(prev => prev[matchday]===g.id ? {} : {...prev, [matchday]:g.id})} className={`px-2 rounded border ${j?'bg-yellow-500 text-black border-yellow-500':'border-gray-700 text-gray-400'}`}>{j?"🃏 פעיל":"🃏 ג'וקר"}</button>
                  </div>
                  <div className="flex justify-between font-black text-sm mb-3">
                    <span className="w-2/5 text-right">{g.home}</span> 
                    <span className="text-gray-600">VS</span> 
                    <span className="w-2/5 text-left">{g.away}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-950 p-3 rounded-xl border border-gray-800" style={{direction:'ltr'}}>
                    <div className="flex gap-2 items-center bg-gray-800 rounded-lg">
                      <button onClick={()=>handleScore(g.id,'a',-1)} className="text-gray-400 font-bold px-2 py-1">-</button>
                      <span className="text-yellow-500 font-black text-lg w-4 text-center">{p.a}</span>
                      <button onClick={()=>handleScore(g.id,'a',1)} className="text-gray-400 font-bold px-2 py-1">+</button>
                    </div>
                    <span className="font-black text-gray-600">:</span>
                    <div className="flex gap-2 items-center bg-gray-800 rounded-lg">
                      <button onClick={()=>handleScore(g.id,'h',-1)} className="text-gray-400 font-bold px-2 py-1">-</button>
                      <span className="text-yellow-500 font-black text-lg w-4 text-center">{p.h}</span>
                      <button onClick={()=>handleScore(g.id,'h',1)} className="text-gray-400 font-bold px-2 py-1">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2 mt-2">
                    {['1','X','2'].map(o => <button key={o} onClick={()=>handlePredict(g.id,o)} className={`flex-1 py-1.5 rounded-lg font-black border ${p.winner===o?'bg-yellow-500 text-black border-yellow-500':'bg-gray-800 border-gray-700'}`}>{o}</button>)}
                  </div>
                </div>
              )
            })}
            <button className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl mt-4 shadow-lg">💾 שמור ניחושים</button>
          </div>
        )}

        {tab === 'tournament' && (
          <div className="space-y-4 bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-black text-yellow-500 text-center mb-2">📝 בחירות לעונה</h2>
            <div>
              <label className="text-xs font-bold text-gray-400">🏆 אלופה (40 נק'):</label>
              <input value={tourney.champion} onChange={e=>setTourney({...tourney, champion:e.target.value})} className="w-full mt-1 bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400">👟 מלך שערים (30 נק'):</label>
              <input value={tourney.topScorer} onChange={e=>setTourney({...tourney, topScorer:e.target.value})} className="w-full mt-1 bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400">🎯 מלך בישולים (50 נק'):</label>
              <input value={tourney.topAssists} onChange={e=>setTourney({...tourney, topAssists:e.target.value})} className="w-full mt-1 bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400">💙 קבוצה אהודה:</label>
              <select value={tourney.favoriteTeam} onChange={e=>setTourney({...tourney, favoriteTeam:e.target.value})} className="w-full mt-1 bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none">
                <option value="">בחר...</option>
                {ISRAELI_TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={()=>alert('הבחירות נשמרו!')} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl mt-2">💾 שמור הכל</button>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-200 mb-3">📊 טבלת הליגה (סטטיסטיקה חיה)</h2>
            <div className="overflow-hidden rounded-lg border border-gray-800">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800 text-gray-400 text-xs">
                    <th className="p-3">#</th>
                    <th className="p-3">שם משתמש</th>
                    <th className="p-3 text-center">נקודות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr className="bg-gray-900">
                    <td className="p-3 font-bold text-center text-xs text-gray-400">1</td>
                    <td className="p-3 font-medium text-white">{username} {tourney.favoriteTeam ? `(${tourney.favoriteTeam})` : ''}</td>
                    <td className="p-3 text-center font-bold text-yellow-500 bg-gray-950/50">{totalPoints}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="flex flex-col h-[65vh] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="bg-gray-800 p-2 text-center text-[10px] font-bold text-gray-400 border-b border-gray-700">💬 השיחות של החבר'ה</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chat.map(c => (
                <div key={c.id} className={`flex flex-col max-w-[85%] ${c.sender===username?'items-end ml-auto':'items-start mr-auto'}`}>
                  <span className="text-[9px] text-gray-500 px-1 mb-0.5">{c.sender} • {c.time}</span>
                  <div className={`p-3 rounded-2xl text-sm ${c.sender===username?'bg-yellow-500 text-black rounded-tl-none font-medium':'bg-gray-800 text-white rounded-tr-none'}`}>{c.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} className="flex p-3 bg-gray-950 border-t border-gray-800 gap-2">
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="כתוב משהו..." className="flex-1 bg-gray-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border focus:border-yellow-500" />
              <button type="submit" className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-black">שלח</button>
            </form>
          </div>
        )}

        {tab === 'rules' && (
          <div className="space-y-4 bg-gray-900 p-5 rounded-2xl border border-gray-800 text-sm text-gray-300">
             <h2 className="text-yellow-500 font-black text-xl text-center border-b border-gray-800 pb-2">🎯 חוקים</h2>
             <p>• <span className="text-white font-bold">כיוון נכון (1,X,2):</span> 2 נקודות.</p>
             <p>• <span className="text-white font-bold">תוצאה מדויקת:</span> 6 נקודות.</p>
             <p>• <span className="text-yellow-500 font-bold">ג'וקר:</span> כופל את הניקוד על המשחק.</p>
             <h3 className="text-yellow-500 font-bold pt-2 border-t border-gray-800 mt-2">👑 בונוסי סוף עונה:</h3>
             <p>• <span className="text-white font-bold">אלופה:</span> 40 נקודות.</p>
             <p>• <span className="text-white font-bold">מלך שערים:</span> 30 נק' + 2 לכל גול.</p>
             <p>• <span className="text-white font-bold">מלך בישולים:</span> 50 נקודות.</p>
          </div>
        )}
      </div>

      <footer className="max-w-md mx-auto mt-6 mb-4 text-center px-4">
        {isAdmin ? (
          <div className="bg-red-950/40 border border-red-900 p-4 rounded-xl text-right">
            <h3 className="text-red-500 font-black text-center border-b border-red-900/50 pb-2 mb-3">🛠️ פאנל מנהל</h3>
            <label className="block text-xs font-bold text-gray-400 mb-1">הודעת מנהל קופצת:</label>
            <div className="flex gap-2">
              <input value={adminAlert} onChange={e=>setAdminAlert(e.target.value)} className="flex-1 bg-gray-900 p-2 text-sm rounded border border-gray-700 text-white" />
              <button onClick={()=>setAdminAlert('')} className="bg-gray-700 px-3 text-xs rounded font-bold">נקה</button>
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-3">הזנת תוצאות אמת תתווסף בחיבור השרת.</p>
            <button onClick={handleAdminLogin} className="w-full mt-3 bg-red-900 text-white py-2 rounded font-bold text-xs">סגור פאנל</button>
          </div>
        ) : (
          <button onClick={handleAdminLogin} className="px-4 py-2 text-[10px] font-bold rounded-lg bg-gray-900 border border-gray-800 text-gray-500">🔧 כניסת מנהל הליגה</button>
        )}
      </footer>
    </div>
  );
}
