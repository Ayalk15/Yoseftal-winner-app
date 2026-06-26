import React, { useState, useEffect } from 'react';

const allFixtures = {
  1: [{ id: 1, home: 'מכבי פ"ת', away: 'הפועל ק"ש', time: '22/08/26' }, { id: 2, home: 'עירוני דורות טבריה', away: 'הפועל פ"ת', time: '22/08/26' }, { id: 3, home: 'הפועל י-ם', away: 'מכבי ת"א', time: '22/08/26' }, { id: 4, home: 'מכבי חיפה', away: 'הפועל ר"ג', time: '22/08/26' }, { id: 5, home: 'הפועל ב"ש', away: 'הפועל חיפה', time: '22/08/26' }, { id: 6, home: 'בית"ר י-ם', away: 'הפועל ת"א', time: '22/08/26' }, { id: 7, home: 'מכבי נתניה', away: 'בני סכנין', time: '22/08/26' }],
  2: [{ id: 1, home: 'בני סכנין', away: 'מכבי פ"ת', time: '29/08/26' }, { id: 2, home: 'מכבי נתניה', away: 'הפועל י-ם', time: '29/08/26' }, { id: 3, home: 'הפועל ת"א', away: 'מכבי חיפה', time: '29/08/26' }, { id: 4, home: 'הפועל ב"ש', away: 'הפועל ר"ג', time: '29/08/26' }, { id: 5, home: 'מכבי חיפה', away: 'מכבי ת"א', time: '29/08/26' }, { id: 6, home: 'הפועל פ"ת', away: 'בית"ר י-ם', time: '29/08/26' }, { id: 7, home: 'עירוני דורות טבריה', away: 'הפועל ק"ש', time: '29/08/26' }]
};

const getGameLockDeadline = (dateStr) => {
  if (!dateStr || dateStr === 'יעודכן בהמשך') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const gameDate = new Date(2000 + parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  const lockDate = new Date(gameDate.getTime() - 24 * 60 * 60 * 1000);
  lockDate.setHours(0, 0, 0, 0);
  return lockDate;
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [liveClockText, setLiveClockText] = useState('');
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [tempUsername, setTempUsername] = useState('');

  const [predictions, setPredictions] = useState(() => JSON.parse(localStorage.getItem('predictions')) || {});
  const [tournament, setTournament] = useState(() => JSON.parse(localStorage.getItem('tournament')) || { champion: '', topScorer: '', topAssists: '' });
  const [jokers, setJokers] = useState(() => JSON.parse(localStorage.getItem('jokers')) || {});
  const [chatMessages, setChatMessages] = useState(() => JSON.parse(localStorage.getItem('chatMessages')) || [
    { id: 1, sender: 'מערכת', text: 'ברוכים הבאים לליגת יוספטל! המערכת פתוחה לניחושים.', time: '12:00' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  useEffect(() => { localStorage.setItem('predictions', JSON.stringify(predictions)); }, [predictions]);
  useEffect(() => { localStorage.setItem('tournament', JSON.stringify(tournament)); }, [tournament]);
  useEffect(() => { localStorage.setItem('jokers', JSON.stringify(jokers)); }, [jokers]);
  useEffect(() => { localStorage.setItem('chatMessages', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('username', username); }, [username]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !username) return;
    const now = new Date();
    setChatMessages([...chatMessages, { id: Date.now(), sender: username, text: newChatMessage, time: now.toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}) }]);
    setNewChatMessage('');
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveClockText(now.toLocaleDateString('he-IL') + ' • ' + now.toLocaleTimeString('he-IL'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePredict = (gameId, value) => {
    setPredictions(prev => ({ ...prev, [`${matchday}-${gameId}`]: { ...(prev[`${matchday}-${gameId}`] || { homeScore: 0, awayScore: 0 }), winner: value } }));
  };

  const handleScoreChange = (gameId, type, delta) => {
    setPredictions(prev => {
      const current = prev[`${matchday}-${gameId}`] || { winner: '', homeScore: 0, awayScore: 0 };
      let newScore = current[type === 'home' ? 'homeScore' : 'awayScore'] + delta;
      if (newScore < 0) newScore = 0;
      const updated = { ...current, [type === 'home' ? 'homeScore' : 'awayScore']: newScore };
      updated.winner = updated.homeScore > updated.awayScore ? '1' : updated.homeScore < updated.awayScore ? '2' : 'X';
      return { ...prev, [`${matchday}-${gameId}`]: updated };
    });
  };

  const toggleJoker = (gameId) => {
    setJokers(prev => {
      if (prev[matchday] === gameId) {
        const updated = { ...prev }; delete updated[matchday]; return updated;
      }
      return { ...prev, [matchday]: gameId };
    });
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-white" style={{ direction: 'rtl' }}>
        <div className="bg-gray-900 p-8 rounded-2xl border border-yellow-500 text-center w-full max-w-sm">
          <h1 className="text-3xl font-black text-yellow-500 mb-6">🏆 יוספטל</h1>
          <input type="text" placeholder="איך קוראים לך?" className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 text-center mb-4 focus:outline-none" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} />
          <button onClick={() => { if(tempUsername.trim()) setUsername(tempUsername.trim()) }} className="w-full bg-yellow-500 text-gray-950 font-black py-3 rounded-xl">היכנס למשחק</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24" style={{ direction: 'rtl' }}>
      <div className="sticky top-0 bg-gray-950/95 pt-2 pb-3 z-40 max-w-md mx-auto px-2 border-b border-gray-900/50">
        <header className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border-b border-yellow-500/30">
          <div>
            <h1 className="text-xl font-extrabold text-yellow-500">🏆 יוספטל</h1>
            <div className="text-[10px] text-gray-400 font-bold">{liveClockText}</div>
          </div>
          <div className="bg-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700">👤 {username}</div>
        </header>

        <nav className="grid grid-cols-5 gap-1 bg-gray-900 p-1 rounded-xl mt-2 border border-gray-800">
          {['predictions', 'tournament', 'leaderboard', 'chat', 'rules'].map(tab => (
            <button key={tab} onClick={() => setCurrentTab(tab)} className={`py-2 text-[10px] font-black rounded-lg ${currentTab === tab ? 'bg-yellow-500 text-gray-950' : 'text-gray-400'}`}>
              {tab === 'predictions' ? 'משחקים' : tab === 'tournament' ? 'הימורים' : tab === 'leaderboard' ? 'טבלה' : tab === 'chat' ? 'צ\'אט' : 'חוקים'}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-md mx-auto mt-4 px-2">
        {currentTab === 'predictions' && (
          <div className="space-y-4">
            <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none">
              {[1, 2].map(i => <option key={i} value={i}>מחזור {i}</option>)}
            </select>
            
            {allFixtures[matchday]?.map(game => {
              const pred = predictions[`${matchday}-${game.id}`] || { winner: '', homeScore: 0, awayScore: 0 };
              const isJoker = jokers[matchday] === game.id;

              return (
                <div key={game.id} className={`border rounded-xl p-4 shadow-md space-y-3 ${isJoker ? 'bg-gradient-to-br from-gray-900 to-amber-950/40 border-yellow-600' : 'bg-gray-900 border-gray-800'}`}>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-sm w-5/12 text-right">{game.home}</span>
                    <span className="text-gray-600 text-xs font-black">VS</span>
                    <span className="font-bold text-sm w-5/12 text-left">{game.away}</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-950 p-3 rounded-xl border border-gray-800" style={{ direction: 'ltr' }}>
                    <div className="flex items-center bg-gray-800 rounded-lg">
                      <button onClick={() => handleScoreChange(game.id, 'away', -1)} className="px-2 py-1 text-gray-400">-</button>
                      <span className="px-3 text-yellow-500 font-black">{pred.awayScore}</span>
                      <button onClick={() => handleScoreChange(game.id, 'away', 1)} className="px-2 py-1 text-gray-400">+</button>
                    </div>
                    <span className="text-gray-600 font-black">:</span>
                    <div className="flex items-center bg-gray-800 rounded-lg">
                      <button onClick={() => handleScoreChange(game.id, 'home', -1)} className="px-2 py-1 text-gray-400">-</button>
                      <span className="px-3 text-yellow-500 font-black">{pred.homeScore}</span>
                      <button onClick={() => handleScoreChange(game.id, 'home', 1)} className="px-2 py-1 text-gray-400">+</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {['1', 'X', '2'].map(o => (
                      <button key={o} onClick={() => handlePredict(game.id, o)} className={`py-1.5 text-xs font-black rounded-lg border ${pred.winner === o ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-800 border-gray-700'}`}>{o}</button>
                    ))}
                    <button onClick={() => toggleJoker(game.id)} className={`py-1.5 text-[10px] font-black rounded-lg border ${isJoker ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>ג'וקר</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentTab === 'tournament' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-black text-yellow-500 text-center">📝 ניחושים מיוחדים</h2>
            <input type="text" value={tournament.champion} onChange={(e) => setTournament({...tournament, champion: e.target.value})} placeholder="אלופה (40 נק')" className="w-full bg-gray-800 p-3 rounded-lg text-white text-sm border border-gray-700"/>
            <input type="text" value={tournament.topScorer} onChange={(e) => setTournament({...tournament, topScorer: e.target.value})} placeholder="מלך שערים (30 נק')" className="w-full bg-gray-800 p-3 rounded-lg text-white text-sm border border-gray-700"/>
            <input type="text" value={tournament.topAssists} onChange={(e) => setTournament({...tournament, topAssists: e.target.value})} placeholder="מלך בישולים (50 נק')" className="w-full bg-gray-800 p-3 rounded-lg text-white text-sm border border-gray-700"/>
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-bold text-gray-200 mb-3">📊 טבלה</h2>
            <div className="flex justify-between bg-gray-800 p-3 rounded text-sm text-gray-300 font-bold">
              <span>{username}</span>
              <span className="text-yellow-500">0 נק'</span>
            </div>
          </div>
        )}

        {currentTab === 'chat' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl flex flex-col h-[60vh]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.sender === username ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
                  <span className="text-[10px] text-gray-500 px-1">{msg.sender}</span>
                  <div className={`p-3 rounded-xl text-sm ${msg.sender === username ? 'bg-yellow-500 text-gray-950 rounded-tr-none' : 'bg-gray-800 text-white rounded-tl-none'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="p-3 bg-gray-950 flex gap-2">
              <input type="text" placeholder="כתוב..." className="flex-1 bg-gray-800 rounded-xl px-4 text-sm text-white focus:outline-none" value={newChatMessage} onChange={(e) => setNewChatMessage(e.target.value)} />
              <button type="submit" className="bg-yellow-500 text-gray-950 px-4 py-2 rounded-xl font-bold">שלח</button>
            </form>
          </div>
        )}

        {currentTab === 'rules' && (
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-3 text-sm text-gray-300">
             <h2 className="text-yellow-500 font-black text-xl">🎯 חוקים</h2>
             <p>• ניחוש כיוון: 2 נק'.</p>
             <p>• ניחוש מדויק: 6 נק'.</p>
             <p>• ג'וקר: כפל ניקוד.</p>
             <p>• אלופה: 40 נק'.</p>
             <p>• מלך שערים: 30 נק' + 2 לכל שער.</p>
             <p>• מלך בישולים: 50 נק'.</p>
          </div>
        )}
      </div>
    </div>
  );
}
