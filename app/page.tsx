'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// =========================================================================
// 🟢 VARIABEL GLOBAL
// =========================================================================
const QUIZ_CONFIG = [
  { id: 'PRETEST',    num: '01', title: 'PRETEST',    desc: 'Uji kompetensi awal sebelum pemaparan materi sensus.', active: true },
  { id: 'POST_TEST',  num: '02', title: 'POST TEST',  desc: 'Uji capaian akhir setelah seluruh rangkaian pelatihan selesai.', active: true },
  { id: 'ASYNC_1',    num: '03', title: 'ASYNC 1',    desc: 'Tugas Latihan Hari Pertama - Kasus Keluarga Pak Amran.', active: true },
  { id: 'ASYNC_2',    num: '04', title: 'ASYNC 2',    desc: 'Pendalaman mandiri pengisian aplikasi pengolahan data lapangan.', active: true },
  { id: 'PENDALAMAN', num: '05', title: 'PENDALAMAN', desc: 'Soal Pendalaman Pelatihan SE2026', active: true },
  { id: 'EVALUASI',   num: '06', title: 'EVALUASI',   desc: 'Form Penilaian dan Evaluasi Kinerja Penyelenggaraan Pelatihan.', active: true }, // 🟢 MODUL BARU
  // {
  //   id: 'RANDOM_NAMA',
  //   num: '07',
  //   title: 'RANDOM NAMA',
  //   desc: 'Lucky Draw dan Pemilihan Peserta Acak',
  //   active: true
  // }
];

const CONFIG_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0ASuvyBBfg9ujkgKXJMNtYuHcG8Sp5Vi5nohOYvNw8dMZ1lNcHRbBudC2-AzRoBl1rMLYD1RsaeQV/pub?gid=1943593608&single=true&output=csv";
const MATERI_GDRIVE_URL = "https://drive.google.com/drive/folders/1LeTT5syakgNUVtOyuPYIeW6kGrSg_2BJ";

// =========================================================================
// 🟢 KOMPONEN UTAMA
// =========================================================================
function PortalGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeModulParam = searchParams.get('modul') || ''; 

  // Menggunakan State Dinamis (Tarik dari CSV)
  const [gasUrl, setGasUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [iframeBuster, setIframeBuster] = useState<number>(0);

  // Misi: Menarik Data Config dari CSV
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(CONFIG_CSV_URL, { cache: 'no-store' });
        const csvText = await response.text();
        const rows = csvText.split('\n');
        
        let foundUrl = '';
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(','); 
          const key = cols[0]?.trim();
          
          if (key === 'GAS_URL') {
            // 🟢 Taktik Presisi: Hanya ambil Kolom B (cols[1]), abaikan koma CSV sisanya
            foundUrl = cols[1]?.trim().replace(/^"|"$/g, ''); 
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
    if (id === 'ASYNC_1') router.push('?modul=Async1');
    else if (id === 'ASYNC_2') router.push('?modul=Async2')
    else if (id === 'PENDALAMAN') router.push('?modul=Pendalaman');
    else if (id === 'POST_TEST') window.open('https://docs.google.com/forms/d/e/1FAIpQLSfW4Jn7myxYt4rbj86iiBgSjaT6CeiuZgfBFymq29dbedC8kA/viewform?usp=header', '_blank');
    else if (id === 'PRETEST') 
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSeI7zHMFrEEtF7GgrFuX1GojTWqQAbg1H1mA2ySEF1i7CRxOA/viewform', '_blank');
    else if (id === 'EVALUASI') router.push('?modul=evaluasi'); // 🟢 RUTE BARU
    // 🟢 TAMBAHKAN INI (Hanya untuk Admin/Instruktur yang tahu link-nya)
    else if (id === 'ADMIN_EVALUASI') router.push('?modul=adminevaluasi');
    // else if (id === 'RANDOM_NAMA') router.push('?modul=randomnama');
  };

  // Fungsi Force Refresh Config dari Spreadsheet
  const handleForceRefreshConfig = async () => {
    setIsSyncing(true);
    try {
      const forcedCsvUrl = `${CONFIG_CSV_URL}&timestamp=${Date.now()}`;
      const response = await fetch(forcedCsvUrl, { cache: 'no-store' });
      const csvText = await response.text();
      const rows = csvText.split('\n');
      
      let foundUrl = '';
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(','); 
        const key = cols[0]?.trim();
        
        if (key === 'GAS_URL') {
          // 🟢 Taktik Presisi
          foundUrl = cols[1]?.trim().replace(/^"|"$/g, ''); 
          break;
        }
      }

      if (foundUrl) {
        setGasUrl(foundUrl);
        setIframeBuster(Date.now()); 
        alert('⚡ SINKRONISASI SUKSES: GAS_URL terbaru berhasil ditarik dan diterapkan!');
      } else {
        alert('⚠️ Master Config terbaca, namun GAS_URL tidak ditemukan.');
      }
    } catch (err) {
      alert('❌ GAGAL RE-FETCH: Koneksi ke server induk terputus.');
    } finally {
      setIsSyncing(false);
    }
  };

  // LAYAR LOADING
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-cyan-400 font-mono">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse tracking-widest text-sm">SINKRONISASI INSTRUMEN CONFIG...</p>
      </div>
    );
  }

  // LAYAR ERROR
  if (error || !gasUrl) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-rose-500 flex-col gap-4">
        <p className="font-mono tracking-wider">⚠️ {error}</p>
        <button onClick={handleForceRefreshConfig} className="bg-rose-600/20 hover:bg-rose-600 border border-rose-500 text-white px-4 py-2 rounded transition">
          Coba Sinkronisasi Ulang
        </button>
      </div>
    );
  }

  // LAYAR DASHBOARD MENU UTAMA
  if (activeModulParam === '') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex flex-col items-center relative">
        <div className="w-full max-w-5xl mt-12 animate-fade-in">
          
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

            <div className="mt-6">
              <a 
                href={MATERI_GDRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-200 border border-indigo-500/30"
              >
                <span className="text-base">Buka Repository</span>
                <span>📂</span>
                <span>DOWNLOAD MATERI (GDRIVE)</span>
              </a>
            </div>

            <div className="mt-10 w-full max-w-2xl mx-auto">
              {/* Kontainer Utama: Stacking di HP, Grid 2 Kolom di Tablet/Laptop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* PORTAL 1: LOGIN INSTRUKTUR (TEMA INDIGO/BLUE) */}
                <button 
                  onClick={() => router.push('?modul=PortalInstruktur')}
                  className="group relative flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Lingkaran Ikon */}
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    {/* Teks Deskripsi */}
                    <div className="text-left">
                      <p className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase">Akses Panel</p>
                      <p className="text-sm font-black text-slate-200 mt-0.5">Login Instruktur</p>
                    </div>
                  </div>
                  {/* Panah Indikator */}
                  <span className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200 text-sm">➔</span>
                </button>

                {/* PORTAL 2: LOGIN EVALUASI (TEMA EMERALD/GREEN) */}
                <button 
                  onClick={() => router.push('?modul=PortalEvaluasi')}
                  className="group relative flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Lingkaran Ikon */}
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    {/* Teks Deskripsi */}
                    <div className="text-left">
                      <p className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase">Monitoring Sentral</p>
                      <p className="text-sm font-black text-slate-200 mt-0.5">Login Evaluasi</p>
                    </div>
                  </div>
                  {/* Panah Indikator */}
                  <span className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200 text-sm">➔</span>
                </button>

              </div>
            </div>

            
          </div>

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

        <div className="fixed bottom-6 right-6 z-50 group">
          <div className="bg-slate-800/50 backdrop-blur-sm text-slate-500 p-2.5 rounded-full cursor-help hover:bg-slate-800 hover:text-cyan-400 shadow-lg border border-slate-700/50 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block w-max max-w-sm bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl text-xs font-mono text-slate-300 animate-fade-in pointer-events-none">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <p className="font-black text-cyan-400 tracking-widest uppercase">System Diagnostics</p>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-slate-500 font-bold mb-0.5">TARGET_GAS_URL:</p>
                <p className="break-all text-green-400 bg-slate-950 p-1.5 rounded border border-slate-800 selection:bg-cyan-900">
                  {gasUrl || '⚠️ Menunggu Fetch...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleForceRefreshConfig}
            disabled={isSyncing}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold border transition flex items-center gap-2 select-none ${
              isSyncing 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 cursor-wait' 
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500 hover:text-cyan-400'
            }`}
            title="Tarik versi GAS_URL terbaru dari spreadsheet"
          >
            <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {isSyncing ? 'MEMAKSA RE-FETCH...' : 'HARD REFRESH CONFIG'}
          </button>
          <button
            onClick={() => router.push('?modul=luckydraw')}
            disabled={isSyncing}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold border transition flex items-center gap-2 select-none ${
              isSyncing 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 cursor-wait' 
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500 hover:text-cyan-400'
            }`}
            title="Random Orang"
          >
            <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            🎰 Lucky Draw
          </button>
      
          <div className="text-cyan-500 font-mono text-xs font-bold tracking-widest animate-pulse flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-cyan-500 block"></span>
            REKOR DATA AKTIF
          </div>
        </div>
      </div>
    );
  }

  // LAYAR RUNNER KUIS (IFRAME)
  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 overflow-hidden relative">
      <div className="bg-slate-950 border-b border-slate-800 p-3 flex justify-between items-center shadow-md z-10">
        <button 
          onClick={() => router.push('/')} 
          className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border border-slate-700/50"
        >
          ← KEMBALI KE PORTAL DASHBOARD
        </button>
      </div>
      
      <iframe
        src={`${gasUrl}?page=${activeModulParam}&cachebuster=${iframeBuster}`}
        className="w-full flex-1 border-0"
        allowFullScreen
        title="Kuis Evaluasi Lapangan SE2026"
      />
    </div>
  );
}

export default function CommandCenterGateway() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-cyan-400 font-mono">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse tracking-widest text-sm">MEMUAT ENGINE NAVIGASI...</p>
      </div>
    }>
      <PortalGatewayContent />
    </Suspense>
  );
}