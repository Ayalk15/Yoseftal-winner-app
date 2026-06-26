import React, { useState, useEffect } from 'react';
import { allFixtures, ISRAELI_TEAMS } from './data.js';

export default function App() {
  const [tab, setTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [tempUser, setTempUser] = useState('');
  
  const [preds, setPreds] = useState(() => JSON.parse(localStorage.getItem('preds')) || {});
  const [tourney, setTourney] = useState(() => JSON.parse(localStorage.getItem('tourney')) || { champion: '', topScorer: '', topAssists: '', favoriteTeam: '' });
  const [jokers, setJokers] = useState(() => JSON.parse(localStorage.getItem('jokers')) || {});
  const [actualScores, setActualScores] = useState(() => JSON.parse(localStorage.getItem('actualScores')) || {});
  const [chat, setChat] = useState(() => JSON.parse(localStorage.getItem('chat')) || [{ id: 1, sender: 'מערכת', text: 'ברוכים הבאים לליגת יוספטל!' }]);
  const [newMsg, setNewMsg] = useState('');
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAlert, setAdminAlert] = useState(() => localStorage.getItem('adminAlert') || '⚽ לא לשכוח להזין ניחושים עונתיים!');

  useEffect(() => { localStorage.setItem('preds', JSON.stringify(preds)); }, [preds]);
  useEffect(() => { localStorage.setItem('tourney', JSON.stringify(tourney)); }, [tourney]);
  useEffect(() => { localStorage.setItem('jokers', JSON.stringify(jokers)); }, [jokers]);
  useEffect(() => { localStorage.setItem('actualScores', JSON.stringify(actualScores)); }, [actualScores]);
  useEffect(() => { localStorage.setItem('chat', JSON.stringify(chat)); }, [chat]);
  useEffect(() => { localStorage.setItem('username', username); }, [username]);
  useEffect(() => { localStorage.setItem('adminAlert', adminAlert); }, [adminAlert]);

  const totalPoints = () => {
    let pts = 0;
    Object.keys(actualScores).forEach(k => {
      const a = actualScores[k], p = preds[k];
      if (a?.isFinished && p) {
        const [md, gId] = k.split('-');
        let mPts = 0;
        if (p.winner === a.winner) {
          mPts += 2;
          if (Number(p.h) === Number(a.homeScore) && Number(p.a) === Number(a.awayScore)) mPts += 4;
        }
        if (jokers[md] && String(jokers[md]) === String(gId)) mPts *= 2;
        pts += mPts;
      }
    });
    return pts;
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-white" style={{ direction: 'rtl' }}>
        <div className="bg-gray-900 p-8 rounded-xl border border-yellow-500 text-center w-full max-w-sm">
          <h1 className="text-3xl font-black text-yellow-500 mb-6">🏆 יוספטל</h1>
          <input type="text" placeholder="איך קוראים לך?" className="w-full bg-gray-800 p-3 rounded-lg text-white mb-4 text-center focus:outline-none" value={tempUser} onChange={(e) => setTempUser(e.target.value)} />
          <button onClick={() => { if(tempUser.trim()) setUsername(tempUser.trim()) }} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl">היכנס למשחק</button>
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

  const handleAdminScore = (id, type, d) => {
    setActualScores(p => {
      const key = `${matchday}-${id}`;
      const c = p[key] || { homeScore: 0, awayScore: 0, winner: 'X', isFinished: false };
      let n = c[type] + d; if (n < 0) n = 0;
      const u = { ...c, [type]: n };
      u.winner = u.homeScore > u.awayScore ? '1' : u.homeScore < u.awayScore ? '2' : 'X';
      return { ...p, [key]: u };
    });
  };

  const toggleAdminFinished = (id) => {
    setActualScores(p => {
      const key = `${matchday}-${id}`;
      const c = p[key] || { homeScore: 0, awayScore: 0, winner: 'X', isFinished: false };
      return { ...p, [key]: { ...c, isFinished: !c.isFinished } };
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24" style={{ direction: 'rtl' }}>
      {adminAlert && <div className="bg-red-950 text-red-400 p-2 text-xs font-bold text-center border-b border-red-900 animate-pulse">🚨 {adminAlert}</div>}
      <header className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="font-black text-yellow-500">🏆 ליגת יוספטל</h1>
        <span className="text-xs bg-gray-800 px-3 py-1 rounded">👤 {username}</span>
      </header>
      
      <nav className="flex bg-gray-900 p-2 text-[11px] font-bold overflow-x-auto border-b border-gray-800">
        {['predictions', 'tournament', 'leaderboard', 'chat', 'rules'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 mx-1 rounded-lg ${tab===t?'bg-yellow-500 text-black':'text-gray-400'}`}>
            {t==='predictions'?'משחקים':t==='tournament'?'הימורים':t==='leaderboard'?'טבלה':t==='chat'?'צ\'אט':'חוקים'}
          </button>
        ))}
      </nav>

      <div className="p-4 max-w-md mx-auto">
        {tab === 'predictions' && (
          <div className="space-y-4">
            <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none">
              {[...Array(36).keys()].map(i => <option key={i+1} value={i+1}>מחזור {i+1}</option>)}
            </select>

            {allFixtures[matchday]?.map(g => {
              const p = preds[`${matchday}-${g.id}`] || {winner:'', h:0, a:0};
              const act = actualScores[`${matchday}-${g.id}`] || {homeScore:0, awayScore:0, winner:'X', isFinished:false};
              const j = jokers[matchday] === g.id;
              return (
                <div key={g.id} className={`bg-gray-900 p-4 rounded-xl border ${j?'border-yellow-500 bg-gradient-to-br from-gray-900 to-amber-950/20':'border-gray-800'}`}>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-2">
                    <span>{g.time}</span>
                    <button onClick={() => setJokers(p => p[matchday]===g.id ? {} : {...p, [matchday]:g.id})} className={`px-2 rounded border ${j?'bg-yellow-500 text-black border-yellow-500':'border-gray-700'}`}>ג'וקר</button>
                  </div>
                  <div className="flex justify-between font-black text-sm mb-4">
                    <span className="w-2/5 text-right">{g.home}</span><span className="text-gray-600">VS</span><span className="w-2/5 text-left">{g.away}</span>
                  </div>
                  
                  <div className="flex justify-center gap-4 mb-4" style={{direction:'ltr'}}>
                    <div className="flex gap-2 bg-gray-950 border border-gray-800 px-3 py-1 rounded-lg items-center">
                      <button onClick={()=>handleScore(g.id,'a',-1)} className="text-gray-400 font-bold px-2">-</button>
                      <span className="text-yellow-500 font-black">{p.a}</span>
                      <button onClick={()=>handleScore(g.id,'a',1)} className="text-gray-400 font-bold px-2">+</button>
                    </div>
                    <span className="font-black text-gray-600 pt-1">:</span>
                    <div className="flex gap-2 bg-gray-950 border border-gray-800 px-3 py-1 rounded-lg items-center">
                      <button onClick={()=>handleScore(g.id,'h',-1)} className="text-gray-400 font-bold px-2">-</button>
                      <span className="text-yellow-500 font-black">{p.h}</span>
                      <button onClick={()=>handleScore(g.id,'h',1)} className="text-gray-400 font-bold px-2">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    {['1','X','2'].map(o => <button key={o} onClick={()=>handlePredict(g.id,o)} className={`flex-1 py-2 rounded-lg font-black border ${p.winner===o?'bg-yellow-500 text-black border-yellow-500':'bg-gray-800 border-gray-700'}`}>{o}</button>)}
                  </div>

                  {act.isFinished && (
                    <div className="mt-3 p-2 bg-gray-950 rounded-lg text-center text-xs text-green-400 font-bold">
                      תוצאת אמת: {act.homeScore} - {act.awayScore} ({act.winner})
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'tournament' && (
          <div className="space-y-4 bg-gray-900 p-5 rounded-xl border border-gray-800">
            <h2 className="text-lg font-black text-yellow-500 text-center">📝 הימורי עונה</h2>
            <input placeholder="🏆 אלופה (40 נק')" value={tourney.champion} onChange={e=>setTourney({...tourney, champion:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-sm border border-gray-700 focus:outline-none" />
            <input placeholder="👟 מלך שערים (30 נק')" value={tourney.topScorer} onChange={e=>setTourney({...tourney, topScorer:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-sm border border-gray-700 focus:outline-none" />
            <input placeholder="🎯 מלך בישולים (50 נק')" value={tourney.topAssists} onChange={e=>setTourney({...tourney, topAssists:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-sm border border-gray-700 focus:outline-none" />
            <select value={tourney.favoriteTeam} onChange={e=>setTourney({...tourney, favoriteTeam:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-sm border border-gray-700 text-white font-bold">
              <option value="">קבוצה אהודה בארץ...</option>
              {ISRAELI_TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={()=>alert('נשמר!')} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl">שמור בחירות</button>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-bold mb-3 text-yellow-500">📊 טבלת הליגה חיה</h2>
            <div className="flex justify-between bg-gray-800 p-3 rounded text-sm font-bold">
              <span>{username} {tourney.favoriteTeam ? `(${tourney.favoriteTeam})` : ''}</span>
              <span className="text-yellow-500">{totalPoints()} נק'</span>
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="flex flex-col h-[60vh] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chat.map(c => <div key={c.id} className={`p-3 rounded-xl text-sm max-w-[85%] ${c.sender===username?'bg-yellow-500 text-black mr-auto':'bg-gray-800 text-white ml-auto'}`}><div className="text-[9px] opacity-60 font-bold mb-1">{c.sender}</div>{c.text}</div>)}
            </div>
            <form onSubmit={(e)=>{e.preventDefault(); if(!newMsg.trim())return; setChat([...chat,{id:Date.now(),sender:username,text:newMsg}]); setNewMsg('');}} className="flex p-3 bg-gray-950 border-t border-gray-800 gap-2">
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="הודעה..." className="flex-1 bg-gray-800 rounded-xl px-4 text-sm text-white focus:outline-none" />
              <button type="submit" className="bg-yellow-500 text-black px-4 rounded-xl font-bold">שלח</button>
            </form>
          </div>
        )}

        {tab === 'rules' && (
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 text-sm text-gray-300 space-y-2">
             <h2 className="text-yellow-500 font-black text-lg">🎯 שיטת הניקוד</h2>
             <p>• כיוון (1,X,2): 2 נקודות.</p>
             <p>• תוצאה מדויקת: 6 נקודות.</p>
             <p>• ג'וקר: כפל ניקוד.</p>
             <h2 className="text-yellow-500 font-black text-lg pt-2">👑 בונוסים</h2>
             <p>• אלופה: 40 נקודות | מלך שערים: 30 נק' (+2 לכל גול) | מלך בישולים: 50 נק'.</p>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 bg-red-950/30 border border-red-900 p-4 rounded-xl space-y-4">
            <h3 className="text-red-500 font-black text-center border-b border-red-900/40 pb-2">🔧 פאנל מנהל הליגה</h3>
            <div>
              <label className="text-xs text-gray-400">עדכן התראת מנהל:</label>
              <input value={adminAlert} onChange={e=>setAdminAlert(e.target.value)} className="w-full mt-1 bg-gray-900 p-2 text-xs rounded border border-gray-700 text-white" />
            </div>
            
            <div className="space-y-3 pt-2 border-t border-red-900/40">
              <h4 className="text-xs font-bold text-gray-300">הזנת תוצאות אמת למחזור {matchday}:</h4>
              {allFixtures[matchday]?.map(g => {
                const act = actualScores[`${matchday}-${g.id}`] || {homeScore:0, awayScore:0, winner:'X', isFinished:false};
                return (
                  <div key={g.id} className="bg-gray-900 p-2 rounded border border-gray-800 text-xs flex flex-col gap-2">
                    <div className="flex justify-between font-bold"><span>{g.home}</span><span>vs</span><span>{g.away}</span></div>
                    <div className="flex justify-between items-center" style={{direction:'ltr'}}>
                      <div className="flex gap-1 items-center bg-gray-950 px-2 py-0.5 rounded">
                        <button onClick={()=>handleAdminScore(g.id,'away',-1)} className="text-gray-500 px-1">-</button>
                        <span className="text-red-400 font-bold">{act.awayScore}</span>
                        <button onClick={()=>handleAdminScore(g.id,'away',1)} className="text-gray-500 px-1">+</button>
                      </div>
                      <div className="flex gap-1 items-center bg-gray-950 px-2 py-0.5 rounded">
                        <button onClick={()=>handleAdminScore(g.id,'home',-1)} className="text-gray-500 px-1">-</button>
                        <span className="text-red-400 font-bold">{act.homeScore}</span>
                        <button onClick={()=>handleAdminScore(g.id,'home',1)} className="text-gray-500 px-1">+</button>
                      </div>
                      <button onClick={()=>toggleAdminFinished(g.id)} className={`px-2 py-1 rounded text-[10px] font-bold ${act.isFinished?'bg-green-900 text-green-300':'bg-gray-800 text-gray-400'}`}>
                        {act.isFinished?'✅ סופי':'⏳ פתוח'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 text-center"><button onClick={() => { if (isAdmin) setIsAdmin(false); else if (prompt('סיסמת מנהל:') === '2531') setIsAdmin(true); else alert('שגיאה'); }} className="text-[10px] font-bold text-gray-600 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">{isAdmin?'סגור פאנל':'🔧 פאנל ניהול (2531)'}</button></footer>
    </div>
  );
}
