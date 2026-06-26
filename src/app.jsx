import React, { useState, useEffect } from 'react';

const allFixtures = {
  1: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל ק"ש', time: '22/08/26' }, { id: 2, home: 'עירוני דורות טבריה', away: 'הפועל פ"ת', time: '22/08/26' }, { id: 3, home: 'הפועל י-ם', away: 'מכבי ת"א', time: '22/08/26' }, { id: 4, home: 'מכבי חיפה', away: 'הפועל ר"ג', time: '22/08/26' }, { id: 5, home: 'הפועל ב"ש', away: 'הפועל חיפה', time: '22/08/26' }, { id: 6, home: 'בית"ר י-ם', away: 'הפועל ת"א', time: '22/08/26' }, { id: 7, home: 'מכבי נתניה', away: 'בני סכנין', time: '22/08/26' }],
  2: [{ id: 1, home: 'בני סכנין', away: 'מכבי פ"ת', time: '29/08/26' }, { id: 2, home: 'מכבי נתניה', away: 'הפועל י-ם', time: '29/08/26' }, { id: 3, home: 'הפועל ת"א', away: 'מכבי חיפה', time: '29/08/26' }, { id: 4, home: 'הפועל ב"ש', away: 'הפועל ר"ג', time: '29/08/26' }, { id: 5, home: 'מכבי חיפה', away: 'מכבי ת"א', time: '29/08/26' }, { id: 6, home: 'הפועל פ"ת', away: 'בית"ר י-ם', time: '29/08/26' }, { id: 7, home: 'עירוני דורות טבריה', away: 'הפועל ק"ש', time: '29/08/26' }]
};

export default function App() {
  const [tab, setTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [tempUser, setTempUser] = useState('');
  const [preds, setPreds] = useState(() => JSON.parse(localStorage.getItem('preds')) || {});
  const [tourney, setTourney] = useState(() => JSON.parse(localStorage.getItem('tourney')) || { champion: '', topScorer: '', topAssists: '' });
  const [jokers, setJokers] = useState(() => JSON.parse(localStorage.getItem('jokers')) || {});
  const [chat, setChat] = useState(() => JSON.parse(localStorage.getItem('chat')) || [{ id: 1, sender: 'מערכת', text: 'ברוכים הבאים לליגת יוספטל!' }]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => { localStorage.setItem('preds', JSON.stringify(preds)); }, [preds]);
  useEffect(() => { localStorage.setItem('tourney', JSON.stringify(tourney)); }, [tourney]);
  useEffect(() => { localStorage.setItem('jokers', JSON.stringify(jokers)); }, [jokers]);
  useEffect(() => { localStorage.setItem('chat', JSON.stringify(chat)); }, [chat]);
  useEffect(() => { localStorage.setItem('username', username); }, [username]);

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

  const sendChat = (e) => {
    e.preventDefault();
    if(!newMsg.trim()) return;
    setChat([...chat, { id: Date.now(), sender: username, text: newMsg }]);
    setNewMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24" style={{ direction: 'rtl' }}>
      <header className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center z-50 shadow-md">
        <h1 className="font-black text-yellow-500 text-lg">🏆 יוספטל</h1>
        <span className="text-xs bg-gray-800 px-3 py-1 rounded-md font-bold">👤 {username}</span>
      </header>
      
      <nav className="flex justify-between bg-gray-900 p-2 border-b border-gray-800 text-[11px] font-bold overflow-x-auto">
        {['predictions', 'tournament', 'chat', 'rules'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 mx-1 rounded-lg whitespace-nowrap ${tab===t?'bg-yellow-500 text-black':'text-gray-400'}`}>
            {t==='predictions'?'משחקים':t==='tournament'?'הימורים':t==='chat'?'צ\'אט':'חוקים'}
          </button>
        ))}
      </nav>

      <div className="p-4 max-w-md mx-auto">
        {tab === 'predictions' && (
          <div className="space-y-4">
            <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none">
              <option value={1}>מחזור 1</option>
              <option value={2}>מחזור 2</option>
            </select>

            {allFixtures[matchday]?.map(g => {
              const p = preds[`${matchday}-${g.id}`] || {winner:'', h:0, a:0};
              const j = jokers[matchday] === g.id;
              return (
                <div key={g.id} className={`bg-gray-900 p-4 rounded-xl border ${j?'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]':'border-gray-800 shadow-md'}`}>
                  <div className="flex justify-between font-black text-sm mb-4">
                    <span className="w-2/5 text-right">{g.home}</span> 
                    <span className="text-gray-600">VS</span> 
                    <span className="w-2/5 text-left">{g.away}</span>
                  </div>
                  <div className="flex justify-center gap-4 mb-4" style={{direction:'ltr'}}>
                    <div className="flex gap-3 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg items-center">
                      <button onClick={()=>handleScore(g.id,'a',-1)} className="text-gray-400 font-bold px-2">-</button>
                      <span className="text-yellow-500 font-black text-lg w-4 text-center">{p.a}</span>
                      <button onClick={()=>handleScore(g.id,'a',1)} className="text-gray-400 font-bold px-2">+</button>
                    </div>
                    <span className="font-black text-gray-600 pt-2">:</span>
                    <div className="flex gap-3 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg items-center">
                      <button onClick={()=>handleScore(g.id,'h',-1)} className="text-gray-400 font-bold px-2">-</button>
                      <span className="text-yellow-500 font-black text-lg w-4 text-center">{p.h}</span>
                      <button onClick={()=>handleScore(g.id,'h',1)} className="text-gray-400 font-bold px-2">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    {['1','X','2'].map(o => <button key={o} onClick={()=>handlePredict(g.id,o)} className={`flex-1 py-2 rounded-lg font-black border ${p.winner===o?'bg-yellow-500 text-black border-yellow-500':'bg-gray-800 border-gray-700'}`}>{o}</button>)}
                    <button onClick={()=>setJokers(prev => prev[matchday]===g.id ? {} : {...prev, [matchday]:g.id})} className={`flex-1 text-[11px] font-black rounded-lg border ${j?'bg-yellow-500 text-black border-yellow-500':'bg-gray-800 border-gray-700 text-gray-400'}`}>ג'וקר</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'tournament' && (
          <div className="space-y-4 bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-black text-yellow-500 text-center mb-2">📝 ניחושים מיוחדים</h2>
            <input placeholder="🏆 אלופה (40 נק')" value={tourney.champion} onChange={e=>setTourney({...tourney, champion:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none" />
            <input placeholder="👟 מלך שערים (30 נק')" value={tourney.topScorer} onChange={e=>setTourney({...tourney, topScorer:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none" />
            <input placeholder="🎯 מלך בישולים (50 נק')" value={tourney.topAssists} onChange={e=>setTourney({...tourney, topAssists:e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none" />
            <button onClick={()=>alert('נשמר בהצלחה!')} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl mt-2">💾 שמור בחירות</button>
          </div>
        )}

        {tab === 'chat' && (
          <div className="flex flex-col h-[65vh] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="bg-gray-800 p-2 text-center text-[10px] font-bold text-gray-400 border-b border-gray-700">💬 חדר הלבשה</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chat.map(c => <div key={c.id} className={`p-3 rounded-2xl text-sm max-w-[85%] ${c.sender===username?'bg-yellow-500 text-black mr-auto rounded-tl-none font-medium':'bg-gray-800 text-white ml-auto rounded-tr-none'}`}><div className="text-[10px] opacity-70 mb-1 font-bold">{c.sender}</div>{c.text}</div>)}
            </div>
            <form onSubmit={sendChat} className="flex p-3 bg-gray-950 border-t border-gray-800 gap-2">
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="הודעה..." className="flex-1 bg-gray-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border focus:border-yellow-500" />
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
    </div>
  );
}
