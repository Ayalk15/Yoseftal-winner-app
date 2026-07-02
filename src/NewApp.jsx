import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';

// הנה הייבוא החכם מהקובץ החיצוני - בלי ללכלך את הקוד המרכזי!
import { allFixtures, ISRAELI_TEAMS, teamNameDictionary } from './fixtures';

const API_KEY = "5d206f3c710f80b55467e863fa4b99d7";

const getGameLockDeadline = (dateStr) => {
  if (!dateStr || dateStr === 'יעודכן בהמשך') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = 2000 + parseInt(parts[2], 10);
  const gameDate = new Date(year, month, day);
  const lockDate = new Date(gameDate.getTime() - 24 * 60 * 60 * 1000);
  lockDate.setHours(0, 0, 0, 0);
  return lockDate;
};

const isGameLockedByDate = (dateStr) => {
  const deadline = getGameLockDeadline(dateStr);
  if (!deadline) return false;
  return new Date() >= deadline;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('predictions');
  const [matchday, setMatchday] = useState(1);
  const [liveClockText, setLiveClockText] = useState('');
  const [countdownText, setCountdownText] = useState('');
  const [saveStatus, setSaveStatus] = useState('✅ כל השינויים נשמרו בענן');

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminMatchday, setAdminMatchday] = useState(1);
  const [adminMessage1, setAdminMessage1] = useState("");
  const [adminMessage2, setAdminMessage2] = useState("");
  const [actualScores, setActualScores] = useState({});
  const [lockedMatchdays, setLockedMatchdays] = useState({});
  const [isTournamentLocked, setIsTournamentLocked] = useState(false);
  const [seasonResults, setSeasonResults] = useState({ champion: '', topScorer: '' });
  const [playerGoals, setPlayerGoals] = useState({});
  const [newTrackedPlayer, setNewTrackedPlayer] = useState('');

  const [predictions, setPredictions] = useState({});
  const [tournament, setTournament] = useState({ champion: '', topScorer: '', favoriteTeam: '' });
  const [jokers, setJokers] = useState({});
  
  const [allUsersData, setAllUsersData] = useState({}); 
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // האזנה חיה לנתוני המשתמש המחובר למניעת הבהובים וסנכרון בין טאבים
  useEffect(() => {
    if (!user) return;
    const unsubMyDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (JSON.stringify(d.predictions) !== JSON.stringify(predictions)) {
          setPredictions(d.predictions || {});
        }
        if (JSON.stringify(d.tournament) !== JSON.stringify(tournament)) {
          setTournament(d.tournament || { champion: '', topScorer: '', favoriteTeam: '' });
        }
        if (JSON.stringify(d.jokers) !== JSON.stringify(jokers)) {
          setJokers(d.jokers || {});
        }
      }
    });
    return () => unsubMyDoc();
  }, [user]);

  // מנגנון שמירה אוטומטית מבוסס Debounce של 1.5 שניות
  useEffect(() => {
    if (!user || !isDataReady) return;

    setSaveStatus('🔄 מזהה שינויים...');
    const delayDebounceFn = setTimeout(async () => {
      try {
        setSaveStatus('⚡ שומר אוטומטית לענן...');
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName || user.email.split('@')[0],
          predictions,
          tournament,
          jokers
        }, { merge: true });
        setSaveStatus('✅ כל השינויים נשמרו בענן');
      } catch (e) {
        setSaveStatus('❌ שגיאה בשמירה האוטומטית');
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [predictions, tournament, jokers, user, isDataReady]);

  useEffect(() => {
    if (!user) return; 

    const unsubGlobal = onSnapshot(doc(db, "league", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAdminMessage1(data.adminMessage1 || "");
        setAdminMessage2(data.adminMessage2 || "");
        setActualScores(data.actualScores || {});
        setLockedMatchdays(data.lockedMatchdays || {});
        setIsTournamentLocked(data.isTournamentLocked || false);
        setSeasonResults(data.seasonResults || { champion: '', topScorer: '' });
        setPlayerGoals(data.playerGoals || {});
      }
      setIsDataReady(true);
    }, (error) => { setIsDataReady(true); });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersMap = {};
      snapshot.forEach(d => { usersMap[d.id] = d.data(); });
      setAllUsersData(usersMap);
    });

    return () => { unsubGlobal(); unsubUsers(); };
  }, [user]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveClockText(now.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }) + ' • ' + now.toLocaleTimeString('he-IL'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      if (lockedMatchdays[matchday]) { setCountdownText('🔒 מחזור זה נעול על ידי מנהל'); return; }
      const fixtures = allFixtures[matchday];
      if (!fixtures || fixtures.length === 0) { setCountdownText(''); return; }
      let earliestDeadline = null;
      fixtures.forEach(g => {
        const d = getGameLockDeadline(g.time);
        if (d && (!earliestDeadline || d < earliestDeadline)) earliestDeadline = d;
      });
      if (!earliestDeadline) { setCountdownText(''); return; }
      const diff = earliestDeadline.getTime() - new Date().getTime();
      if (diff <= 0) { setCountdownText('🔒 מחזור זה נעול לניחושים!'); } 
      else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdownText(`⏱️ נעילת ניחושים בעוד: ${days} ימים, ${hours} שעות ו-${minutes} דקות`);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [matchday, lockedMatchdays]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginMode) { await signInWithEmailAndPassword(auth, email, password); }
      else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nickname });
        await setDoc(doc(db, "users", userCredential.user.uid), { displayName: nickname, predictions: {}, tournament: { champion: '', topScorer: '', favoriteTeam: '' }, jokers: {} });
        setUser({ ...userCredential.user, displayName: nickname });
      }
    } catch (err) { setAuthError('שגיאה בתהליך האימות.'); }
  };

  const handleLogout = () => { signOut(auth); };

  const handleEditNickname = async () => {
    const currentName = user?.displayName || user?.email?.split('@')[0];
    const newName = prompt('הכנס כינוי חדש (השם שיופיע בטבלה):', currentName);
    if (newName && newName.trim() !== '' && newName !== currentName) {
      try {
        await updateProfile(auth.currentUser, { displayName: newName.trim() });
        setUser({ ...auth.currentUser, displayName: newName.trim() });
        await setDoc(doc(db, "users", user.uid), { displayName: newName.trim() }, { merge: true });
        alert('הכינוי שלך עודכן בהצלחה בענן!');
      } catch (err) { alert('שגיאה בעדכון הכינוי.'); }
    }
  };

  const loginAsAdmin = () => {
    if (allUsersData[user?.uid]?.isAdmin) {
      setIsAdminMode(!isAdminMode);
    } else {
      alert("אין לך הרשאות מנהל במערכת זו. יש להגדיר isAdmin: true בדוקומנט שלך ב-Firebase.");
    }
  };

  const handleSaveAdminData = async () => {
    try {
      await setDoc(doc(db, "league", "global"), { adminMessage1, adminMessage2, actualScores, lockedMatchdays, isTournamentLocked, seasonResults, playerGoals }, { merge: true });
      alert('נתוני מנהל סונכרנו לענן! ☁️');
    } catch (e) { alert('שגיאה בשמירה: ' + e.message); }
  };

  const toggleMatchdayLock = (md, shouldLock) => { setLockedMatchdays(prev => ({ ...prev, [md]: shouldLock })); };
  
  const addPlayerToTracker = () => {
    if (newTrackedPlayer.trim() && playerGoals[newTrackedPlayer.trim()] === undefined) {
      setPlayerGoals(prev => ({ ...prev, [newTrackedPlayer.trim()]: 0 }));
      setNewTrackedPlayer('');
    }
  };

  const handlePlayerGoalUpdate = (playerName, delta) => {
    setPlayerGoals(prev => {
      const current = prev[playerName] || 0;
      return { ...prev, [playerName]: Math.max(0, current + delta) };
    });
  };

  const handleActualScoreChange = (gameId, type, val) => {
    const score = parseInt(val) || 0;
    setActualScores(prev => {
      const key = `${adminMatchday}-${gameId}`;
      const current = prev[key] || { homeScore: 0, awayScore: 0, isFinished: false, winner: 'X' };
      const updated = { ...current, [type === 'home' ? 'homeScore' : 'awayScore']: score };
      if (updated.homeScore > updated.awayScore) updated.winner = '1';
      else if (updated.homeScore < updated.awayScore) updated.winner = '2';
      else updated.winner = 'X';
      return { ...prev, [key]: updated };
    });
  };

  const toggleGameFinished = (gameId) => {
    setActualScores(prev => {
      const key = `${adminMatchday}-${gameId}`;
      const current = prev[key] || { homeScore: 0, awayScore: 0, isFinished: false, winner: 'X' };
      return { ...prev, [key]: { ...current, isFinished: !current.isFinished } };
    });
  };

  const handleAutoFill = () => {
    if (lockedMatchdays[matchday]) { alert('המחזור נעול!'); return; }
    if (!window.confirm("למלא ניחושים אקראיים למחזור זה?")) return;
    setPredictions(prev => {
      const newPredictions = { ...prev };
      allFixtures[matchday]?.forEach(game => {
        const key = `${matchday}-${game.id}`;
        const home = Math.floor(Math.random() * 4);
        const away = Math.floor(Math.random() * 4);
        let winner = home > away ? '1' : home < away ? '2' : 'X';
        newPredictions[key] = { winner, homeScore: home, awayScore: away };
      });
      return newPredictions;
    });
  };

  const handleFetchLiveScoresAPI = async () => {
    try {
      alert("מתחבר לשרת התוצאות...");
      const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all-283", { 
        method: "GET",
        headers: { "x-rapidapi-host": "v3.football.api-sports.io", "x-rapidapi-key": API_KEY }
      });
      if (!response.ok) throw new Error("שגיאה בחיבור לשרת.");
      const data = await response.json();
      let updatedCount = 0;
      let newScores = { ...actualScores }; 
      if (data.response && data.response.length > 0) {
          data.response.forEach(game => {
             const apiHome = teamNameDictionary[game.teams.home.name] || game.teams.home.name;
             const apiAway = teamNameDictionary[game.teams.away.name] || game.teams.away.name;
             const homeGoals = game.goals.home;
             const awayGoals = game.goals.away;
             const isFinished = game.fixture.status.short === "FT"; 
             if (homeGoals !== null && awayGoals !== null) {
                allFixtures[adminMatchday]?.forEach(localGame => {
                   if (localGame.home === apiHome && localGame.away === apiAway) {
                      const key = `${adminMatchday}-${localGame.id}`;
                      let winner = homeGoals > awayGoals ? '1' : homeGoals < awayGoals ? '2' : 'X';
                      newScores[key] = { homeScore: homeGoals, awayScore: awayGoals, isFinished: isFinished || (newScores[key]?.isFinished || false), winner: winner };
                      updatedCount++;
                   }
                });
             }
          });
      }
      if (updatedCount > 0) { setActualScores(newScores); alert(`עודכנו ${updatedCount} משחקים במערכת.`); }
      else { alert("לא נמצאו משחקים פעילים ברגע זה."); }
    } catch (error) { alert("שגיאה ב-API: " + error.message); }
  };

  const handlePredict = (gameId, value) => {
    if (lockedMatchdays[matchday]) { alert('נעול!'); return; }
    setPredictions(prev => {
      const key = `${matchday}-${gameId}`;
      const current = prev[key] || { winner: '', homeScore: 0, awayScore: 0 };
      return { ...prev, [key]: { ...current, winner: value } };
    });
  };

  const handleScoreChange = (gameId, type, delta) => {
    if (lockedMatchdays[matchday]) { alert('נעול!'); return; }
    setPredictions(prev => {
      const key = `${matchday}-${gameId}`;
      const current = prev[key] || { winner: '', homeScore: 0, awayScore: 0 };
      let newScore = current[type === 'home' ? 'homeScore' : 'awayScore'] + delta;
      if (newScore < 0) newScore = 0;
      const updated = { ...current, [type === 'home' ? 'homeScore' : 'awayScore']: newScore };
      updated.winner = updated.homeScore > updated.awayScore ? '1' : updated.homeScore < updated.awayScore ? '2' : 'X';
      return { ...prev, [key]: updated };
    });
  };

  const toggleJoker = (gameId, isLocked) => {
    if (isLocked || lockedMatchdays[matchday]) return;
    setJokers(prev => {
      if (prev[matchday] === gameId) { const updated = { ...prev }; delete updated[matchday]; return updated; }
      return { ...prev, [matchday]: gameId };
    });
  };

  const displayUsername = user?.displayName || user?.email?.split('@')[0];

  const calculatePointsForUser = (userData) => {
    let pts = 0;
    const uPreds = userData.predictions || {};
    const uJokers = userData.jokers || {};
    const uTourn = userData.tournament || {};
    Object.keys(actualScores).forEach(key => {
      const actual = actualScores[key];
      const pred = uPreds[key];
      if (actual && actual.isFinished && pred) {
        const [md, gameId] = key.split('-');
        let localPts = 0;
        if (pred.winner === actual.winner) {
          localPts += 2;
          if (Number(pred.homeScore) === Number(actual.homeScore) && Number(pred.awayScore) === Number(actual.awayScore)) { localPts += 4; }
        }
        if (uJokers[md] && String(uJokers[md]) === String(gameId)) localPts *= 2;
        pts += localPts;
      }
    });
    if (seasonResults.champion && uTourn.champion === seasonResults.champion) pts += 30;
    if (seasonResults.topScorer && uTourn.topScorer === seasonResults.topScorer) pts += 20;
    if (uTourn.topScorer && playerGoals[uTourn.topScorer]) pts += (playerGoals[uTourn.topScorer] * 2);
    return pts;
  };

  const getMatchdayPointsForUser = (md, userData) => {
    let pts = 0;
    const uPreds = userData.predictions || {};
    const uJokers = userData.jokers || {};
    allFixtures[md]?.forEach(game => {
      const key = `${md}-${game.id}`;
      const actual = actualScores[key];
      const pred = uPreds[key];
      if (actual && actual.isFinished && pred) {
        let local = 0;
        if (pred.winner === actual.winner) {
          local += 2;
          if (Number(pred.homeScore) === Number(actual.homeScore) && Number(pred.awayScore) === Number(actual.awayScore)) { local += 4; }
        }
        if (uJokers[md] && String(uJokers[md]) === String(game.id)) local *= 2;
        pts += local;
      }
    });
    return pts;
  };

  const getDetailedStatsForUser = (u) => {
    let exactHits = 0; let directionHits = 0; let totalFinished = 0; let loyaltyCount = 0;
    const uPreds = u.predictions || {};
    const uTeam = u.tournament?.favoriteTeam;
    Object.keys(actualScores).forEach(key => {
        const actual = actualScores[key];
        const pred = uPreds[key];
        if (actual && actual.isFinished && pred && pred.winner) {
            totalFinished++;
            if (pred.winner === actual.winner) {
                directionHits++;
                if (Number(pred.homeScore) === Number(actual.homeScore) && Number(pred.awayScore) === Number(actual.awayScore)) { exactHits++; }
            }
        }
    });
    if (uTeam) {
        Object.keys(allFixtures).forEach(md => {
            allFixtures[md].forEach(game => {
                if (game.home === uTeam || game.away === uTeam) {
                    const gKey = `${md}-${game.id}`;
                    if (uPreds[gKey] && uPreds[gKey].winner) loyaltyCount++;
                }
            });
        });
    }
    const hitRatePct = totalFinished > 0 ? Math.round((directionHits / totalFinished) * 100) : 0;
    let badges = [];
    if (exactHits >= 3) badges.push({ icon: '🎯', title: 'צלף (3+ פגיעות בול)' });
    if (hitRatePct >= 50 && totalFinished >= 5) badges.push({ icon: '🔥', title: 'לוהט (מעל 50% הצלחה)' });
    if (loyaltyCount >= 5) badges.push({ icon: '🛡️', title: 'אוהד שרוף (5+ הימורים על הקבוצה)' });
    return { exactHits, directionHits, totalFinished, hitRatePct, loyaltyCount, badges };
  };

  // אופטימיזציה לטבלה הכללית באמצעות useMemo
  const leaderboardArr = useMemo(() => {
    return Object.entries(allUsersData).map(([uid, u]) => {
       const stats = getDetailedStatsForUser(u);
       return { uid, name: u.displayName || 'משתמש', team: u.tournament?.favoriteTeam || '', points: calculatePointsForUser(u), stats, tournament: u.tournament || {} };
    }).sort((a, b) => b.points - a.points);
  }, [allUsersData, actualScores, seasonResults, playerGoals]);

  if (leaderboardArr.length > 0 && leaderboardArr[0].points > 0) {
      if (!leaderboardArr[0].stats.badges.some(b => b.title === 'מקום ראשון')) {
          leaderboardArr[0].stats.badges.unshift({ icon: '👑', title: 'מקום ראשון' });
      }
  }

  const getMVP = () => {
    let maxPts = 0;
    let mvps = [];
    Object.values(allUsersData).forEach(u => {
      const pts = getMatchdayPointsForUser(matchday, u);
      if (pts > maxPts) { maxPts = pts; mvps = [u.displayName || 'משתמש']; }
      else if (pts === maxPts && pts > 0) { mvps.push(u.displayName || 'משתמש'); }
    });
    if (maxPts > 0) return `${mvps.join(', ')} עם ${maxPts} נק'! 🏆`;
    return `אין נתונים למחזור ${matchday}`;
  };

  const myDetailedStats = getDetailedStatsForUser({ predictions, tournament, jokers });
  const myStats = calculatePointsForUser({ predictions, tournament, jokers });

  let bestMatchday = 1;
  let maxMdPts = -1;
  for (let i = 1; i <= 36; i++) {
      const pts = getMatchdayPointsForUser(i, {predictions, jokers});
      if (pts > maxMdPts) { maxMdPts = pts; bestMatchday = i; }
  }

  if (isCheckingAuth) { return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-yellow-500 font-bold text-xl" style={{ direction: 'rtl' }}>בודק חיבור למערכת...</div>; }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-white" style={{ direction: 'rtl', backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%), url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
        <div className="bg-gray-900/90 border-2 border-yellow-500 rounded-2xl p-8 shadow-[0_0_30px_rgba(234,179,8,0.2)] max-w-sm w-full backdrop-blur-md">
          <h1 className="text-3xl font-black text-yellow-500 text-center mb-2">🏆 ליגת יוספטל</h1>
          <p className="text-gray-400 text-center text-sm mb-8 font-bold">התחבר כדי להתחיל לנחש (מחובר לענן ☁️)</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="אימייל" className="w-full bg-gray-800 p-3 rounded-lg text-white border border-gray-700 focus:outline-none" style={{ direction: 'ltr' }} />
            {!isLoginMode && <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} required placeholder="כינוי" className="w-full bg-gray-800 p-3 rounded-lg text-white border border-gray-700" />}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="סיסמה" className="w-full bg-gray-800 p-3 rounded-lg text-white border border-gray-700 focus:outline-none" style={{ direction: 'ltr' }} />
            {authError && <div className="text-red-500 text-sm font-bold text-center">{authError}</div>}
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-gray-950 font-black py-3 rounded-xl">{isLoginMode ? 'כניסה' : 'הרשמה'}</button>
          </form>
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full mt-4 text-yellow-500 font-bold">{isLoginMode ? 'לחץ כאן להרשמה' : 'לחץ כאן להתחברות'}</button>
        </div>
      </div>
    );
  }

  if (!isDataReady) { return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-yellow-500 font-bold text-xl">טוען נתונים מהענן...</div>; }

  return (
    <div className="min-h-screen text-white p-4 pb-28" style={{ direction: 'rtl', backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%), url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
      <div className="sticky top-0 pt-2 pb-3 z-50 max-w-md mx-auto" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
        <header className="text-center p-4 bg-gray-900 rounded-xl border-b-2 border-yellow-500 relative shadow-[0_4px_15px_-3px_rgba(234,179,8,0.2)]">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-lg">☰</button>
          
          <h1 className="text-2xl font-extrabold text-yellow-500 mt-2">🏆 ליגת יוספטל</h1>
          <div className="flex justify-center items-center gap-2 mt-1">
            <p className="text-gray-300 text-sm font-bold">שלום, <span className="text-yellow-500">{displayUsername}</span> 👋</p>
            <button onClick={handleEditNickname} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 hover:text-white transition-colors">✏️ ערוך כינוי</button>
          </div>
          <div className="text-sm text-white font-bold mt-2 bg-gray-800 inline-block px-4 py-1 rounded-full shadow-inner border border-gray-700">{liveClockText}</div>
          <p className="text-[11px] text-gray-400 font-bold mt-2">{saveStatus}</p>

          {isMenuOpen && (
            <div className="absolute top-16 right-4 bg-gray-800 rounded-xl shadow-2xl p-2 flex flex-col gap-1 w-48 text-right z-50">
              {['predictions', 'tournament', 'leaderboard', 'stats', 'rules', 'public'].map(tab => (
                <button key={tab} onClick={() => { setCurrentTab(tab); setIsMenuOpen(false); }} className={`px-3 py-2 text-sm font-bold rounded-lg ${currentTab === tab ? 'bg-yellow-500 text-gray-950' : 'text-gray-300'}`}>
                  {tab === 'predictions' ? '⚽ משחקים' : tab === 'tournament' ? '👑 הטורניר' : tab === 'leaderboard' ? '📊 טבלה' : tab === 'stats' ? '📈 סטט\'' : tab === 'rules' ? 'ℹ️ חוקים' : '👁️ ניחושי כולם'}
                </button>
              ))}
              <button onClick={() => handleLogout()} className="px-3 py-2 text-sm text-red-400 text-right">🚪 התנתק</button>
            </div>
          )}
        </header>
      </div>

      <div className="max-w-md mx-auto mt-2">
        {isAdminMode && allUsersData[user.uid]?.isAdmin && (
          <div className="bg-gray-900 border-2 border-red-600 rounded-xl p-5 mb-4 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <h2 className="text-red-500 font-black text-xl mb-4 border-b border-red-800 pb-2">🔧 פאנל ניהול מערכת</h2>
            
            <div className="mb-4">
               <button onClick={() => setIsTournamentLocked(!isTournamentLocked)} className={`w-full py-2 rounded font-bold ${isTournamentLocked ? 'bg-red-600' : 'bg-green-600'}`}>
                  {isTournamentLocked ? '🔓 פתח בחירות טורניר לשינויים' : '🔒 נעל בחירות טורניר למשתמשים'}
               </button>
            </div>

            <div className="space-y-4 mb-6 border-t border-red-900/50 pt-4">
              <h3 className="text-white font-bold text-sm">📣 ניהול הודעות:</h3>
              <input type="text" value={adminMessage1} onChange={(e) => setAdminMessage1(e.target.value)} className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 outline-none text-sm mb-2" placeholder="הודעת מנהל 1" />
              <input type="text" value={adminMessage2} onChange={(e) => setAdminMessage2(e.target.value)} className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 outline-none text-sm" placeholder="הודעת מנהל 2" />
            </div>

            <div className="border-t border-red-900/50 pt-4">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-white font-bold text-sm">⚽ הזנת תוצאות אמת:</h3>
                 <button onClick={handleFetchLiveScoresAPI} className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-800 hover:bg-blue-800 hover:text-white transition-colors">🔄 עדכן מ-API</button>
              </div>
              
              <select value={adminMatchday} onChange={(e) => setAdminMatchday(Number(e.target.value))} className="w-full bg-red-950/30 text-red-100 p-2 rounded-lg border border-red-800/50 mb-3 text-sm outline-none font-bold">
                {[...Array(36).keys()].map(i => <option key={i + 1} value={i + 1}>מחזור {i + 1}</option>)}
              </select>

              <div className="mb-4 bg-gray-950 border border-red-800 rounded-xl p-3 text-center">
                <div className={`text-sm font-black mb-3 ${lockedMatchdays[adminMatchday] ? 'text-red-400' : 'text-green-400'}`}>
                  {lockedMatchdays[adminMatchday] ? '🔒 מחזור נעול' : '🟢 מחזור פתוח'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => toggleMatchdayLock(adminMatchday, true)} className="bg-red-600 hover:bg-red-500 text-white font-black py-2 rounded-lg text-sm">🔒 נעילת מחזור</button>
                  <button type="button" onClick={() => toggleMatchdayLock(adminMatchday, false)} className="bg-green-600 hover:bg-green-500 text-white font-black py-2 rounded-lg text-sm">🔓 פתיחת מחזור</button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-950 p-2 rounded border border-gray-800">
                  {allFixtures[adminMatchday]?.map(game => {
                    const key = `${adminMatchday}-${game.id}`;
                    const actual = actualScores[key] || { homeScore: 0, awayScore: 0, isFinished: false, winner: 'X' };
                    return (
                      <div key={game.id} className={`flex items-center justify-between p-2 rounded-lg border ${actual.isFinished ? 'bg-red-950/20 border-red-800/50' : 'bg-gray-800 border-gray-700'}`}>
                        <span className="text-xs font-bold w-1/4 text-right truncate text-gray-300">{game.home}</span>
                        <div className="flex gap-1" style={{direction: 'ltr'}}>
                          <input type="number" min="0" value={actual.awayScore} onChange={e => handleActualScoreChange(game.id, 'away', e.target.value)} className="w-8 text-center bg-gray-950 text-white border border-gray-600 rounded text-sm py-1 outline-none focus:border-red-500" disabled={actual.isFinished} />
                          <span>:</span>
                          <input type="number" min="0" value={actual.homeScore} onChange={e => handleActualScoreChange(game.id, 'home', e.target.value)} className="w-8 text-center bg-gray-950 text-white border border-gray-600 rounded text-sm py-1 outline-none focus:border-red-500" disabled={actual.isFinished} />
                        </div>
                        <span className="text-xs font-bold w-1/4 text-left truncate text-gray-300">{game.away}</span>
                        <button onClick={() => toggleGameFinished(game.id)} className={`px-2 py-1 rounded text-[10px] font-black ${actual.isFinished ? 'bg-red-600' : 'bg-gray-700'}`}>{actual.isFinished ? 'נעול' : 'פתוח'}</button>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="border-t border-red-900/50 pt-4 mt-4">
              <h3 className="text-white font-bold text-sm mb-2">⚽ מעקב מלך השערים:</h3>
              <div className="flex gap-2 mb-4">
                 <input value={newTrackedPlayer} onChange={e => setNewTrackedPlayer(e.target.value)} placeholder="שם השחקן למעקב..." className="flex-1 bg-gray-800 text-white p-2 rounded-lg border border-gray-700 text-sm" />
                 <button onClick={addPlayerToTracker} className="bg-blue-600 px-3 rounded-lg text-sm font-bold">הוסף</button>
              </div>
              <div className="space-y-2">
                 {Object.keys(playerGoals).map(player => (
                    <div key={player} className="flex justify-between items-center bg-gray-800 p-2 rounded text-sm">
                       <span>{player}</span>
                       <div className="flex items-center gap-3" style={{direction: 'ltr'}}>
                          <button onClick={() => handlePlayerGoalUpdate(player, -1)} className="bg-gray-700 px-2 rounded">-</button>
                          <span className="font-bold w-4 text-center">{playerGoals[player]}</span>
                          <button onClick={() => handlePlayerGoalUpdate(player, 1)} className="bg-gray-700 px-2 rounded">+</button>
                       </div>
                    </div>
                 ))}
              </div>
            </div>

            <div className="border-t border-red-900/50 pt-4 mt-4">
               <h3 className="text-white font-bold text-sm mb-2">🏁 סיום עונה (קביעת תוצאות אמת):</h3>
               <div className="space-y-2">
                  <input placeholder="שם האלופה הסופית" value={seasonResults.champion} onChange={e => setSeasonResults({...seasonResults, champion: e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 text-sm" />
                  <input placeholder="שם מלך השערים הסופי" value={seasonResults.topScorer} onChange={e => setSeasonResults({...seasonResults, topScorer: e.target.value})} className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 text-sm" />
               </div>
            </div>

            <button onClick={handleSaveAdminData} className="w-full bg-red-600 py-4 rounded-xl font-black mt-4 shadow-lg text-base">💾 שמור וסנכרן נתוני מנהל לענן</button>
          </div>
        )}

        {!isAdminMode && adminMessage1 && (
          <div className="mb-4 bg-gray-900 border border-yellow-500 rounded-xl p-4 shadow-lg text-right">
            <h3 className="text-yellow-500 text-sm font-bold mb-1">📣 הודעת מערכת:</h3>
            <p className="text-xs text-gray-200">{adminMessage1}</p>
            {adminMessage2 && <p className="text-xs text-gray-200 mt-1">{adminMessage2}</p>}
          </div>
        )}

        {currentTab === 'predictions' && (
          <div className="space-y-4">
            <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 shadow-xl space-y-3">
              <select value={matchday} onChange={(e) => setMatchday(Number(e.target.value))} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700">
                {[...Array(36).keys()].map(i => <option key={i + 1} value={i + 1}>מחזור {i + 1}</option>)}
              </select>
              {!lockedMatchdays[matchday] && (
                <button type="button" onClick={handleAutoFill} className="w-full bg-amber-600 hover:bg-amber-500 text-gray-950 py-2 rounded-lg font-black text-sm transition-all shadow">🎲 מלא ניחושים באקראי</button>
              )}
              <div className={`p-2 rounded text-center text-xs font-bold border ${lockedMatchdays[matchday] ? 'bg-red-950/40 border-red-800 text-red-400' : 'bg-green-950/40 border-green-800 text-green-400'}`}>
                {lockedMatchdays[matchday] ? '🔒 מחזור זה נעול להימורים' : '🟢 מחזור פתוח לניחושים - השינויים נשמרים אוטומטית'}
              </div>
            </div>

            {allFixtures[matchday]?.map(game => {
              const gameKey = `${matchday}-${game.id}`;
              const pred = predictions[gameKey] || { winner: '', homeScore: 0, awayScore: 0 };
              const actual = actualScores[gameKey] || { homeScore: 0, awayScore: 0, winner: 'X', isFinished: false };
              const isLocked = lockedMatchdays[matchday] || isGameLockedByDate(game.time) || actual.isFinished;
              const isJoker = jokers[matchday] === game.id;

              return (
                <div key={game.id} className={`border rounded-xl p-4 shadow-md space-y-3 ${isJoker ? 'bg-gradient-to-br from-gray-900 to-amber-950/40 border-yellow-600' : 'bg-gray-900/80 border-gray-800'}`}>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="bg-gray-950 px-2 py-1 rounded border border-gray-800">{game.time}</span>
                    <button type="button" disabled={isLocked} onClick={() => toggleJoker(game.id, isLocked)} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isJoker ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-950 text-gray-500 border-gray-800'}`}>
                      {isJoker ? "🃏 ג'וקר פעיל!" : "🃏 סמן ג'וקר"}
                    </button>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-sm w-5/12 text-right truncate">{game.home}</span>
                    <span className="text-gray-500 text-xs font-bold px-2 bg-gray-950 rounded-full">VS</span>
                    <span className="font-bold text-sm w-5/12 text-left truncate">{game.away}</span>
                  </div>

                  {!isLocked ? (
                    <div className="flex justify-between items-center bg-gray-950 p-2 rounded-xl border border-gray-800" style={{ direction: 'ltr' }}>
                      <div className="flex items-center bg-gray-800 rounded">
                        <button type="button" onClick={() => handleScoreChange(game.id, 'away', -1)} className="px-2 py-1 font-bold text-gray-400">-</button>
                        <span className="px-2 text-yellow-500 font-black min-w-[24px] text-center">{pred.awayScore}</span>
                        <button type="button" onClick={() => handleScoreChange(game.id, 'away', 1)} className="px-2 py-1 font-bold text-gray-400">+</button>
                      </div>
                      <span className="text-gray-500 font-black">:</span>
                      <div className="flex items-center bg-gray-800 rounded">
                        <button type="button" onClick={() => handleScoreChange(game.id, 'home', -1)} className="px-2 py-1 font-bold text-gray-400">-</button>
                        <span className="px-2 text-yellow-500 font-black min-w-[24px] text-center">{pred.homeScore}</span>
                        <button type="button" onClick={() => handleScoreChange(game.id, 'home', 1)} className="px-2 py-1 font-bold text-gray-400">+</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-950 p-2 text-center rounded-lg text-xs text-gray-400 border border-gray-800">
                      הניחוש שלך: <span className="text-yellow-500 font-bold ml-1 text-sm">{pred.winner ? `${pred.homeScore} - ${pred.awayScore}` : 'אין הימור'}</span>
                      {actual.isFinished && <span className="text-gray-500 mr-2">| תוצאת אמת: {actual.homeScore}-{actual.awayScore}</span>}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {['1', 'X', '2'].map(o => (
                      <button key={o} type="button" disabled={isLocked} onClick={() => handlePredict(game.id, o)} className={`py-1.5 text-xs font-bold rounded border ${pred.winner === o ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-800 border-gray-700'} ${isLocked ? 'opacity-50' : ''}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentTab === 'tournament' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-black text-yellow-500 text-center mb-2 border-b border-gray-800 pb-2">🏆 ניחושי טורניר מיוחדים</h2>
            {isTournamentLocked && <div className="text-red-500 text-xs font-bold text-center">🔒 בחירות הטורניר נעולות על ידי המערכת.</div>}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">הקבוצה האהודה שלי בארץ:</label>
              <select value={tournament.favoriteTeam} disabled={isTournamentLocked} onChange={(e) => setTournament({ ...tournament, favoriteTeam: e.target.value })} className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700 focus:outline-none">
                <option value="">-- בחר קבוצה --</option>
                {ISRAELI_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">האלופה המיועדת שלי:</label>
              <input type="text" value={tournament.champion} disabled={isTournamentLocked} onChange={(e) => setTournament({ ...tournament, champion: e.target.value })} placeholder="הקלד שם..." className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">מלך השערים שלי:</label>
              <input type="text" value={tournament.topScorer} disabled={isTournamentLocked} onChange={(e) => setTournament({ ...tournament, topScorer: e.target.value })} placeholder="הקלד שם..." className="w-full bg-gray-800 p-3 rounded-lg text-white font-bold border border-gray-700" />
            </div>
            <p className="text-[11px] text-gray-500 text-center pt-2">✨ הבחירות נשמרות אוטומטית בענן ברקע.</p>
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-200 mb-3 border-b border-gray-800 pb-2">📊 מצב הטבלה הכללית</h2>
            <div className="overflow-hidden rounded-lg border border-gray-700">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-gray-300 text-xs">
                    <th className="p-2 w-10 text-center">מקום</th>
                    <th className="p-2">שם</th>
                    <th className="p-2 text-center w-16">נקודות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {leaderboardArr.map((u, i) => (
                    <tr key={u.uid} onClick={() => setSelectedUserProfile(u)} className={`cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors ${u.uid === user.uid ? 'bg-yellow-900/10' : ''}`}>
                      <td className="p-3 font-black text-center text-yellow-500">{i + 1}</td>
                      <td className="p-3 font-bold flex flex-col">
                         <span className="flex items-center gap-1">
                           {u.name} {u.uid === user.uid ? '(אתה)' : ''}
                           <div className="flex gap-0.5 text-xs">
                             {u.stats.badges.map((b, idx) => <span key={idx} title={b.title}>{b.icon}</span>)}
                           </div>
                         </span>
                      </td>
                      <td className="p-3 text-center font-black text-yellow-500 bg-gray-950/20">{u.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'public' && (
           <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 shadow-xl">
             <h2 className="text-lg font-bold text-yellow-500 mb-3">👁️ ניחושי כולם - מחזור {matchday}</h2>
             {!lockedMatchdays[matchday] ? (
               <div className="text-center py-6">
                 <p className="text-sm text-gray-400">הניחושים חסויים! ייחשפו רק לאחר נעילת המחזור ע"י המנהל.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {Object.keys(allUsersData).map(uid => {
                    const u = allUsersData[uid];
                    return (
                       <div key={uid} className="bg-gray-800 p-3 rounded border border-gray-700">
                          <p className="font-bold text-xs border-b border-gray-700 pb-1 text-yellow-500">{u.displayName || 'משתמש'}</p>
                          <div className="space-y-1 mt-2">
                             {allFixtures[matchday]?.map(game => {
                                const gKey = `${matchday}-${game.id}`;
                                const uPred = u.predictions?.[gKey];
                                if (!uPred || !uPred.winner) return null;
                                return (
                                   <div key={game.id} className="flex justify-between items-center text-[11px] bg-gray-900 p-1 rounded">
                                      <span className="text-gray-400">{game.home} - {game.away}</span>
                                      <span className="font-bold text-white">{uPred.homeScore}:{uPred.awayScore}</span>
                                   </div>
                                )
                             })}
                          </div>
                       </div>
                    );
                 })}
               </div>
             )}
           </div>
        )}

        {currentTab === 'stats' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-5 shadow-xl space-y-4 text-right">
            <h2 className="text-lg font-bold text-yellow-500 text-center">📈 סטטיסטיקה אישית</h2>
            <div className="bg-gray-800 p-3 rounded text-center">
               <p className="text-gray-400 text-xs">סך הנקודות שלך:</p>
               <p className="text-4xl font-black text-yellow-500">{myStats}</p>
            </div>
            <div className="bg-gray-950 p-3 rounded text-xs space-y-2">
              <div className="flex justify-between">
                <span>🎯 דיוק פגיעה:</span>
                <span className="text-yellow-500 font-bold">{myDetailedStats.hitRatePct}%</span>
              </div>
              <div className="flex justify-between border-t border-gray-900 pt-2">
                <span>🎯 פגיעות בול (תוצאה מדויקת):</span>
                <span>{myDetailedStats.exactHits} משחקים</span>
              </div>
              <div className="flex justify-between">
                <span>⚽ פגיעות כיוון (1,X,2):</span>
                <span>{myDetailedStats.directionHits} משחקים</span>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'rules' && (
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-5 shadow-md text-xs leading-relaxed text-gray-300 space-y-3">
            <h2 className="text-yellow-500 font-black text-sm border-b border-gray-800 pb-1">🎯 שיטת הניקוד</h2>
            <p>• ניחוש כיוון נכון (1,X,2): <strong>2 נקודות</strong>.</p>
            <p>• ניחוש תוצאה מדויקת: מוסיף עוד <strong>4 נקודות</strong> (סך הכל 6 נקודות למשחק).</p>
            <p>• משחק <strong>ג'וקר</strong> מעניק כפל ניקוד (עד 12 נקודות למשחק!).</p>
            <h2 className="text-yellow-500 font-black text-sm border-b border-gray-800 pb-1 pt-2">👑 בונוסים מיוחדים</h2>
            <p>• ניחוש אלופה נכון: <strong>30 נקודות</strong> בסוף העונה.</p>
            <p>• ניחוש מלך השערים נכון: <strong>20 נקודות</strong> בסוף העונה.</p>
            <p>• בונוס מלך שערים חי: תקבל <strong>2 נקודות</strong> על כל גול שהשחקן שבחרת יבקיע לאורך העונה כולה!</p>
          </div>
        )}
      </div>

      {selectedUserProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
           <div className="bg-gray-900 border-2 border-yellow-500 rounded-2xl p-5 w-full max-w-sm text-right relative">
              <button onClick={() => setSelectedUserProfile(null)} className="absolute top-3 left-3 bg-gray-800 text-white w-6 h-8 rounded-full font-bold">X</button>
              <h3 className="text-xl font-black mb-2 text-white">{selectedUserProfile.name}</h3>
              <div className="space-y-1 text-xs text-gray-300 bg-gray-950 p-3 rounded">
                <p>🏆 אלופה: {selectedUserProfile.tournament?.champion || 'טרם נבחר'}</p>
                <p>👟 מלך שערים: {selectedUserProfile.tournament?.topScorer || 'טרם נבחר'}</p>
                <p className="border-t border-gray-800 pt-2 mt-2 text-yellow-500 font-bold">סך הכל נקודות: {selectedUserProfile.points}</p>
              </div>
           </div>
        </div>
      )}

      {allUsersData[user?.uid]?.isAdmin && (
        <footer className="max-w-md mx-auto mt-8 mb-4 text-center">
          <button type="button" onClick={loginAsAdmin} className={`px-4 py-1.5 text-xs font-bold rounded border ${isAdminMode ? 'bg-red-950 border-red-800 text-red-400' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
            {isAdminMode ? '🔒 צא ממצב מנהל' : '🔧 כנס לפאנל ניהול'}
          </button>
        </footer>
      )}
      
      <div className="fixed bottom-0 left-0 w-full bg-gray-950/95 backdrop-blur-md border-t border-gray-800 p-2.5 text-center text-xs font-bold text-yellow-500 z-40">
        🌟 MVP המחזור הנוכחי: {getMVP()}
      </div>
    </div>
  );
}
