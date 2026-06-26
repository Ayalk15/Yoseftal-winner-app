import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center justify-center" style={{ direction: 'rtl' }}>
      <div className="w-full max-w-md bg-gray-900 p-6 rounded-2xl border border-yellow-500 text-center shadow-2xl">
        <h1 className="text-3xl font-black text-yellow-500 mb-2">🏆 10 חבר'ה - יוספטל</h1>
        <p className="text-gray-400 text-sm mb-6">מריצים את הפרויקט מהתחלה – נקי, יציב ובטוח!</p>
        
        <div className="bg-gray-800 p-4 rounded-xl text-green-400 font-bold border border-green-900/50 animate-pulse">
          ✅ היסודות מוכנים! הקוד תקין ב-100%.
        </div>
        
        <p className="text-xs text-gray-500 mt-6">עכשיו הגיע הזמן לחבר אותו ל-Vercel ולראות אותו באוויר.</p>
      </div>
    </div>
  );
}
