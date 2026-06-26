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
  const [chat, setChat] = useState(() => JSON.parse(localStorage.getItem('chat')) || [{ id: 1, sender: 'מערכת', text: 'ברוכים הבאים לליגת יוספטל! גרסה 2.0 באוויר.' }]);
  const [newMsg, setNewMsg] = useState('');
  
  // שעון חי
  const [liveClock, setLiveClock] = useState('טוען תאריך ושעון...');

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAlert, setAdminAlert] = useState(() => localStorage.getItem('adminAlert') || '⚽ ליגת יוספטל - גרסה 2.0 המעודכנת באוויר!');

  useEffect(() => { localStorage.setItem('preds', JSON.stringify(preds)); }, [preds]);
  useEffect(() => { localStorage.setItem('tourney', JSON.stringify(tourney)); }, [tourney]);
  useEffect(() => { localStorage.setItem('jokers', JSON.stringify(jokers)); }, [jokers]);
  useEffect(() => { localStorage.setItem('actualScores', JSON.stringify(actualScores)); }, [actualScores]);
  useEffect(() => { localStorage.setItem('chat', JSON.stringify(chat)); }, [chat]);
  useEffect(() => { localStorage.setItem('username', username); }, [username]);
  useEffect(() => { localStorage.setItem('adminAlert', adminAlert); }, [adminAlert]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveClock(now.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }) + ' • ' + now.toLocaleTimeString('he-IL'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // מסך כניסה
  if (!username) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white" style={{ direction: 'rtl' }}>
        <div className="w-full max-w-sm mb-6 text-center bg-gray-900 border border-yellow-500 rounded-xl p-3 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
          <span className="text-yellow-400 font-black text-lg flex items-center justify-center gap-2">
            ⏱️ {liveClock}
          </span>
        </div>
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 text-center w-full max-w-sm">
          <h1 className="text-3xl font-black text-white mb-2">🏆 ליגת יוספטל</h1>
          <p className="text-xs text-green-400 font-bold mb-6">גרסה 2.0 מחוברת!</p>
          <input type="text" placeholder="איך קוראים לך?" className="w-full bg-gray-800 p-3 rounded-lg text-white mb-4 text-center focus:outline-none focus:border focus:border-yellow-500" value={tempUser} onChange={(e) => setTempUser(e.target.value)} />
          <button onClick={() => { if(tempUser.trim()) setUsername(tempUser.trim()) }} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl shadow-lg">היכנס למשחק</button>
        </div>
      </div>
    );
  }

  // מסך ראשי
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24" style={{ direction: 'rtl' }}>
      {adminAlert && <div className="bg-red-950 text-red-400 p-2 text-xs font-bold text-center border-b border-red-900">🚨 {adminAlert}</div>}
      
      <header className="bg-gray-900 pt-4 pb-2 border-b border-gray-800 shadow-md">
        <div className="max-w-md mx-auto px-4">
          {/* שעון חי בולט */}
          <div className="w-full text-center bg-gray-950 border border-yellow-500/50 rounded-lg p-2 mb-4 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
             <span className="text-yellow-400 font-black text-base flex items-center justify-center gap-2">
                ⏱️ {liveClock}
             </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-black text-white text-xl">🏆 ליגת יוספטל</h1>
              <span className="text-[10px] text-green-400 font-bold">גרסה 2.0</span>
            </div>
            <span className="text-sm bg-gray-800 px-3 py-1 rounded font-bold border border-gray-700">👤 {username}</span>
          </div>
        </div>
      </header>
      
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 p-2">
        <nav className="flex max-w-md mx-auto justify-between bg-gray-900 p-1.5 rounded-xl text-[11px] font-black overflow-x-auto">
          {['predictions', 'tournament', 'leaderboard', 'chat', 'rules'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 mx-0.5 rounded-lg whitespace-nowrap transition-colors ${tab===t?'bg-yellow-500 text-black shadow-sm':'text-gray-400'}`}>
              {t==='predictions'?'⚽ משחקים':t==='tournament'?'👑 הימורים':t==='leaderboard'?'📊 טבלה':t==='chat'?'💬 צ\'אט':'ℹ️ חוקים'}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 max-w-md mx-auto mt-2">
        {tab === 'predictions' && (
          <div className="space-y-4">
            <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-xl text-white font-bold border border-gray-700 focus:outline-none">
              {[...Array(36).keys()].map(i => <option key={i+1} value={i+1}>מחזור {i+1}</option>)}
            </select>

            {allFixtures[matchday]?.map(g => {
              const p = preds[`${matchday}-${g.id}`] || {winner:'', h:0, a:0};
              const act = actualScores[`${matchday}-${g.id}`] || {homeScore:0, awayScore:0, winner:'X', isFinished:false};
              const j = jokers[matchday] === g.id;
              return (
                <div key={g.id} className={`bg-gray-900 p-4 rounded-xl border ${j?'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]':'border-gray-800 shadow-md'}`}>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2">
                    <span>{g.time}</span>
                    <button onClick={() => setJokers(p => p[matchday]===g.id ? {} : {...p, [matchday]:g.id})} className={`px-2 py-0.5 rounded border ${j?'bg-yellow-500 text-black border-yellow-500':'border-gray-600 hover:bg-gray-800'}`}>{j?"🃏 ג'וקר פעיל":"🃏 שים ג'וקר"}</button>
                  </div>
                  <div className="flex justify-between font-black text-base mb-4">
                    <span className="w-2/5 text-right">{g.home}</span><span className="text-gray-600 text-sm mt-0.5">VS</span><span className="w-2/5 text-left">{g.away}</span>
                  </div>
                  
                  <div className="flex justify-center gap-4 mb-4" style={{direction:'ltr'}}>
                    <div className="flex gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg items-center">
                      <button onClick={()=>handleScore(g.id,'a',-1)} className="text-gray-400 font-bold px-2 py-1">-</button>
                      <span className="text-yellow-500 font-black text-lg min-w-[20px] text-center">{p.a}</span>
                      <button onClick={()=>handleScore(g.id,'a',1)} className="text-gray-400 font-bold px-2 py-1">+</button>
                    </div>
                    <span className="font-black text-gray-600 pt-2">:</span>
                    <div className="flex gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg items-center">
                      <button onClick={()=>handleScore(g.id,'h',-1)} className="text-gray-400 font-bold px-2 py-1">-</button>
                      <span className="text-yellow-500 font-black text-lg min-w-[20px] text-center">{p.h}</span>
                      <button onClick={()=>handleScore(g.id,'h',1)} className="text-gray-400 font-bold px-2 py-1">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    {['1','X','2'].map(o => <button key={o} onClick={()=>handlePredict(g.id,o)} className={`flex-1 py-2 rounded-lg font-black border transition-all ${p.winner===o?'bg-yellow-500 text-black border-yellow-500':'bg-gray-800 border-gray-700'}`}>{o}</button>)}
                  </div>

                  {act.isFinished && (
                    <div className="mt-4 p-2 bg-green-950/30 border border-green-900 rounded-lg text-center text-xs text-green-400 font-bold">
                      תוצאת אמת: {act.homeScore} - {act.awayScore} ({act.winner})
                    </div>
                  )}
                </div>
              )
            })}
            <button className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl mt-4 shadow-xl">💾 שמור ניחושים במכשיר</button>
          </div>
        )}

        {tab === 'tournament' && (
          <div className="space-y-4 bg-gray-900 p-5 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-lg font-black text-yellow-500 text-center border-b border-gray-800 pb-3">📝 הימורי עונה</h2>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">🏆 אלופה (40 נק'):</label>
              <input value={tourney.champion} onChange={e=>setTourney({...tourney, champion:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-sm text-white font-bold border border-gray-700 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">👟 מלך שערים (30 נק'):</label>
              <input value={tourney.topScorer} onChange={e=>setTourney({...tourney, topScorer:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-sm text-white font-bold border border-gray-700 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">🎯 מלך בישולים (50 נק'):</label>
              <input value={tourney.topAssists} onChange={e=>setTourney({...tourney, topAssists:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-sm text-white font-bold border border-gray-700 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">💙 קבוצה אהודה:</label>
              <select value={tourney.favoriteTeam} onChange={e=>setTourney({...tourney, favoriteTeam:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-sm border border-gray-700 text-white font-bold focus:outline-none">
                <option value="">בחר...</option>
                {ISRAELI_TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={()=>alert('הבחירות נשמרו במכשיר!')} className="w-full bg-yellow-500 text-black font-black py-3.5 rounded-xl mt-4">💾 שמור בחירות</button>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-black mb-4 text-yellow-500 border-b border-gray-800 pb-2">📊 טבלת הליגה</h2>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl text-sm font-bold border border-gray-700">
              <span className="text-white">1. {username} <span className="text-gray-400 text-[10px]">{tourney.favoriteTeam ? `(${tourney.favoriteTeam})` : ''}</span></span>
              <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg">{totalPoints()} נק'</span>
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="flex flex-col h-[60vh] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
            <div className="bg-gray-800 p-3 text-center text-[10px] font-bold text-gray-400 border-b border-gray-700">💬 חדר ההלבשה של יוספטל</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chat.map(c => (
                <div key={c.id} className={`flex flex-col max-w-[85%] ${c.sender===username?'items-end ml-auto':'items-start mr-auto'}`}>
                  <span className="text-[9px] font-bold text-gray-500 px-1 mb-1">{c.sender}</span>
                  <div className={`p-3 rounded-2xl text-sm shadow-md ${c.sender===username?'bg-yellow-500 text-black rounded-tl-none font-medium':'bg-gray-800 text-white rounded-tr-none border border-gray-700'}`}>{c.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={(e)=>{e.preventDefault(); if(!newMsg.trim())return; setChat([...chat,{id:Date.now(),sender:username,text:newMsg}]); setNewMsg('');}} className="flex p-3 bg-gray-950 border-t border-gray-800 gap-2">
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="שלח הודעה לחבר'ה..." className="flex-1 bg-gray-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border focus:border-yellow-500" />
              <button type="submit" className="bg-yellow-500 text-black px-5 rounded-xl font-black">שלח</button>
            </form>
          </div>
        )}

        {tab === 'rules' && (
          <div className="space-y-4 bg-gray-900 p-6 rounded-2xl border border-gray-800 text-sm text-gray-300 shadow-lg leading-relaxed">
             <h2 className="text-yellow-500 font-black text-xl text-center border-b border-gray-800 pb-3">🎯 שיטת הניקוד</h2>
             <div className="space-y-2 pt-2">
               <p>• <span className="text-white font-bold">כיוון נכון (1,X,2):</span> 2 נקודות.</p>
               <p>• <span className="text-white font-bold">תוצאה מדויקת:</span> 6 נקודות (כולל הבונוס).</p>
               <p>• <span className="text-yellow-500 font-bold border border-yellow-500 px-1 rounded text-xs">ג'וקר</span> כופל את הניקוד על משחק אחד לבחירתך בכל מחזור.</p>
             </div>
             
             <h2 className="text-yellow-500 font-black text-xl text-center border-b border-gray-800 pb-3 pt-4">👑 בונוסי עונה</h2>
             <div className="space-y-2 pt-2">
               <p>• <span className="text-white font-bold">אלופה:</span> 40 נקודות.</p>
               <p>• <span className="text-white font-bold">מלך שערים:</span> 30 נקודות <br/><span className="text-xs text-gray-500 pr-3">+2 נקודות על כל גול שהוא יבקיע בפועל.</span></p>
               <p>• <span className="text-white font-bold">מלך בישולים:</span> 50 נקודות.</p>
             </div>
          </div>
        )}

        {isAdmin && (
          <div className="mt-8 bg-red-950/30 border border-red-900 p-5 rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-red-500 font-black text-center border-b border-red-900/40 pb-3">🔧 פאנל מנהל הליגה</h3>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">הודעת מנהל קופצת:</label>
              <input value={adminAlert} onChange={e=>setAdminAlert(e.target.value)} className="w-full bg-gray-900 p-3 text-sm rounded-lg border border-gray-700 text-white focus:outline-none" />
            </div>
            
            <div className="space-y-3 pt-4 border-t border-red-900/40">
              <h4 className="text-sm font-black text-red-400 text-center mb-4">הזנת תוצאות אמת (מחזור {matchday})</h4>
              {allFixtures[matchday]?.map(g => {
                const act = actualScores[`${matchday}-${g.id}`] || {homeScore:0, awayScore:0, winner:'X', isFinished:false};
                return (
                  <div key={g.id} className="bg-gray-900 p-3 rounded-xl border border-gray-800 text-xs flex flex-col gap-3">
                    <div className="flex justify-between font-bold text-sm"><span>{g.home}</span><span className="text-gray-600">vs</span><span>{g.away}</span></div>
                    <div className="flex justify-between items-center" style={{direction:'ltr'}}>
                      <div className="flex gap-2 items-center bg-gray-950 px-2 py-1 rounded-lg border border-gray-800">
                        <button onClick={()=>handleAdminScore(g.id,'a',-1)} className="text-gray-500 font-bold px-2">-</button>
                        <span className="text-red-400 font-black text-base">{act.awayScore}</span>
                        <button onClick={()=>handleAdminScore(g.id,'a',1)} className="text-gray-500 font-bold px-2">+</button>
                      </div>
                      <div className="flex gap-2 items-center bg-gray-950 px-2 py-1 rounded-lg border border-gray-800">
                        <button onClick={()=>handleAdminScore(g.id,'h',-1)} className="text-gray-500 font-bold px-2">-</button>
                        <span className="text-red-400 font-black text-base">{act.homeScore}</span>
                        <button onClick={()=>handleAdminScore(g.id,'h',1)} className="text-gray-500 font-bold px-2">+</button>
                      </div>
                      <button onClick={()=>toggleAdminFinished(g.id)} className={`px-3 py-2 rounded-lg text-[10px] font-black transition-colors ${act.isFinished?'bg-green-600 text-white':'bg-gray-800 text-gray-400'}`}>
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

      <footer className="mt-8 mb-6 text-center px-4">
        <button onClick={() => { if (isAdmin) setIsAdmin(false); else if (prompt('סיסמת מנהל:') === '2531') setIsAdmin(true); else alert('סיסמה שגויה!'); }} className={`text-[11px] font-black px-4 py-2.5 rounded-xl transition-colors ${isAdmin ? 'bg-red-900 text-white' : 'text-gray-500 bg-gray-900 border border-gray-800 hover:text-white'}`}>
          {isAdmin ? 'סגור פאנל ניהול' : '🔧 כניסת מנהל הליגה (2531)'}
        </button>
      </footer>
    </div>
  );
}
