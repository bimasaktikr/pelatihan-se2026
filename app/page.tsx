'use client';

import React, { useEffect, useState } from 'react';

// Konfigurasi internal status keaktifan menu kuis
const QUIZ_CONFIG = [
  { id: 'PRETEST',     num: '01', title: 'PRETEST',     desc: 'Uji kompetensi awal sebelum pemaparan materi sensus.', active: false },
  { id: 'POST_TEST',   num: '02', title: 'POST TEST',   desc: 'Uji capaian akhir setelah seluruh rangkaian pelatihan selesai.', active: false },
  { id: 'ASYNC_1',     num: '03', title: 'ASYNC 1',     desc: 'Tugas Latihan Hari Pertama - Kasus Keluarga Pak Amran.', active: true },
  { id: 'ASYNC_2',     num: '04', title: 'ASYNC 2',     desc: 'Pendalaman mandiri pengisian aplikasi pengolahan data lapangan.', active: true },
  { id: 'PENDALAMAN',  num: '05', title: 'PENDALAMAN',  desc: 'Studi kasus kompleks penanganan rekapitulasi SLS non-responden.', active: false }
];

export default function CommandCenterGateway() {
  const [gasUrl, setGasUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // State navigasi tampilan
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'IFRAME'>('DASHBOARD');
  const [activeQuizParam, setActiveQuizParam] = useState<string>('');

  // =========================================================================
  // 🚨 AREA PORTAL LINK CONFIGURATION (PUSAT KENDALI)
  // =========================================================================
  // 1. Link API CSV Google Sheets Tab Config Anda
  const CONFIG_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0ASuvyBBfg9ujkgKXJMNtYuHcG8Sp5Vi5nohOYvNw8dMZ1lNcHRbBudC2-AzRoBl1rMLYD1RsaeQV/pub?gid=1943593608&single=true&output=csv";

  // 2. Link Google Drive Tempat Menyimpan Folder/File Materi Pelatihan SE2026
  const MATERI_GDRIVE_URL = "https://drive.google.com/drive/folders/1LeTT5syakgNUVtOyuPYIeW6kGrSg_2BJ";
  // =========================================================================

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(CONFIG_CSV_URL, { cache: 'no-store' });
        const csvText = await response.text();
        const rows = csvText.split('\n');
        
        let foundUrl = '';
        for (let i = 1; i < rows.length; i++) {
          const [key, ...valueArr] = rows[i].split(','); 
          if (key && key.trim() === 'GAS_URL') {
            foundUrl = valueArr.join(',').trim().replace(/^"|"$/g, ''); 
            break;
          }
        }

        if (foundUrl) setGasUrl(foundUrl);
        else setError('GAS_URL tidak ditemukan di Master Config Spreadsheet.');
      } catch (err) {
        setError('Gagal sinkronisasi dengan server induk Command Center.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleQuizClick = (id: string) => {
    if (id === 'ASYNC_1') {
      setActiveQuizParam('Async1');
      setCurrentView('IFRAME');
    }
  };

  // --- LAYAR 1: LOADING REAKTOR ---
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-cyan-400 font-mono">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse tracking-widest text-sm">SINKRONISASI INSTRUMEN CONFIG...</p>
      </div>
    );
  }

  // --- LAYAR 2: ERROR PORTAL ---
  if (error || !gasUrl) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-rose-500">
        <p className="font-mono tracking-wider">⚠️ {error}</p>
      </div>
    );
  }

  // --- LAYAR 3: DASHBOARD UTAMA NEXT.JS ---
  if (currentView === 'DASHBOARD') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex flex-col items-center">
        <div className="w-full max-w-5xl mt-12 animate-fade-in">
          
          {/* Header Portal */}
          <div className="text-center mb-12 flex flex-col items-center">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Portal Evaluasi Sentral
            </span>
            <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 mt-4">
              Pelatihan SE2026 BPS Kota Malang
            </h1>
            <p className="text-slate-400 text-sm mt-3 max-w-xl">
              Selamat datang di pusat pengujian kompetensi dan pembelajaran mandiri petugas Sensus Ekonomi 2026.
            </p>

            {/* 📥 NEW FEATURE: TOMBOL DOWNLOAD MATERI GDRIVE */}
            <div className="mt-6">
              <a 
                href={MATERI_GDRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-200 border border-indigo-500/30"
              >
                <span className="text-base">Buka Repository</span>
                <span>📂</span>
                <span>DOWNLOAD MATERI PELATIHAN (GDRIVE)</span>
              </a>
            </div>

          <div className="mt-8">
            <button 
              onClick={() => {
                // Buka di dalam Iframe Next.js, bukan pindah URL
                setActiveQuizParam('PortalInstruktur');
                setCurrentView('IFRAME');
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Login Portal Instruktur
            </button>
          </div>

            {/* // 1. Tambahkan tombol di bagian bawah Header (setelah tombol download materi) */}
          </div>

          {/* Grid Kuis Modular */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUIZ_CONFIG.map(quiz => (
              quiz.active ? (
                <div key={quiz.id} onClick={() => handleQuizClick(quiz.id)} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl cursor-pointer hover:border-cyan-500 hover:scale-[1.02] transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">Terbuka</div>
                  <div className="bg-cyan-500/10 text-cyan-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 font-black group-hover:bg-cyan-500 group-hover:text-slate-950 transition duration-300">
                    {quiz.num}
                  </div>
                  <h2 className="text-xl font-bold tracking-wide text-slate-100 mb-2">{quiz.title}</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">{quiz.desc}</p>
                </div>
              ) : (
                <div key={quiz.id} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 shadow-xl opacity-50 cursor-not-allowed relative group">
                  <div className="absolute top-0 right-0 bg-slate-800 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">🔒 Terkunci</div>
                  <div className="bg-slate-800 text-slate-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 font-black">
                    {quiz.num}
                  </div>
                  <h2 className="text-xl font-bold tracking-wide text-slate-500 mb-2">{quiz.title}</h2>
                  <p className="text-slate-600 text-xs leading-relaxed">{quiz.desc}</p>
                  <div className="mt-4 inline-block bg-slate-800/50 border border-slate-700/30 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
                    Coming Soon
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- LAYAR 4: SUB-IFRAME RUNNER (MODUL KUIS AKTIF) ---
  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top Utility Bar */}
      <div className="bg-slate-950 border-b border-slate-800 p-3 flex justify-between items-center shadow-md z-10">
        <button 
          onClick={() => setCurrentView('DASHBOARD')}
          className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-slate-700/50"
        >
          ← KEMBALI KE PORTAL DASHBOARD
        </button>
        <div className="text-cyan-500 font-mono text-xs font-bold tracking-widest animate-pulse flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500 block"></span>
          REKOR DATA AKTIF
        </div>
      </div>
      
      {/* Iframe injection parameter dinamis page sesuai rute Sheets */}
      <iframe
        src={`${gasUrl}?page=${activeQuizParam}`}
        className="w-full flex-1 border-0"
        allowFullScreen
        title="Kuis Evaluasi Lapangan SE2026"
      />
    </div>
  );
}