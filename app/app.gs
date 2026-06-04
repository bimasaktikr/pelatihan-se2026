/**
 * ==========================================
 * APP.GS - CENTRAL ROUTER SYSTEM
 * ==========================================
 */

function doGet(e) {
  // Ambil parameter rute dari URL
  let targetPage = e.parameter.page || 'Dashboard';
  let template;

  // ROUTER: Daftar "Case" rute yang diizinkan di sistem Anda
  switch (targetPage) {
    case 'PortalInstruktur':
      template = HtmlService.createTemplateFromFile('PortalInstruktur');
      break;
    case 'Monitoring':
      template = HtmlService.createTemplateFromFile('Monitoring');
      break;
    case 'Async1':
      template = HtmlService.createTemplateFromFile('Async1');
      break;
    // Jika user mengakses rute yang tidak terdaftar, arahkan ke halaman utama/default
    default:
      template = HtmlService.createTemplateFromFile('Async1'); 
  }

  try {
    // Eksekusi dan tampilkan halaman
    return template.evaluate()
      .setTitle('Command Center SE2026')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) // Wajib agar bisa masuk Iframe Next.js
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    // Penanganan jika file HTML belum dibuat
    return HtmlService.createHtmlOutput("<h1>Sistem Terkunci</h1><p>Halaman " + targetPage + " belum tersedia di server.</p>");
  }
}


// Fungsi Login Instruktur
function loginInstruktur(email, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Instruktur');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toString().trim() === email.trim() && data[i][2].toString() === password.toString()) {
      // Ambil kelas dari kolom D (3), E (4), F (5) dan buang yang kosong
      let kelasDiampu = [data[i][3], data[i][4], data[i][5]].filter(k => k !== "");
      
      return {
        success: true,
        nama: data[i][0],
        kelas: kelasDiampu
      };
    }
  }
  return { success: false, message: "Email atau Password tidak ditemukan!" };
}

function testTarikData() {
  // UBAH INI: Masukkan satu nama kelas yang Anda YAKIN ada di Sheet Database
  let kelasUjiCoba = ['KELAS_A']; 
  
  let hasil = getPesertaInstrukturLengkap(kelasUjiCoba);
  
  console.log("Jumlah Peserta Ditemukan: " + hasil.length);
  if(hasil.length > 0) {
    console.log("Data Sampel Pertama: ", hasil[0]);
  } else {
    console.log("GAGAL: Tidak ada peserta yang kelasnya cocok dengan " + kelasUjiCoba);
  }
}

// Mengambil profil dan nilai peserta untuk tabel instruktur
function getPesertaInstrukturLengkap(kelasArray) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Database');
  const data = sheet.getDataRange().getValues();
  
  let daftarPeserta = [];

  // Looping mulai dari baris kedua (hindari header)
  for (let i = 1; i < data.length; i++) {
    // Asumsi Kolom J (index 9) adalah Kelas Peserta
    let kelasPeserta = data[i][6] ? data[i][6].toString().trim() : ""; 
    
    if (kelasArray.includes(kelasPeserta)) {
      daftarPeserta.push({
        rowIdx: i + 1, // Untuk keperluan update nilai nanti
        nama: data[i][2], // Asumsi Kolom C
        idSobat: data[i][1], // Asumsi Kolom B
        kelas: kelasPeserta,
        
        // Status & Nilai (Asumsi kolom: Pretest=10,11 | Post=12,13 | Async1=14,15 | Async2=16,17)
        // Sesuaikan index ini dengan struktur Database Anda!
        pre_status: data[i][10], pre_score: data[i][11],
        post_status: data[i][12], post_score: data[i][13],
        async1_status: data[i][14], async1_score: data[i][15],
        async2_status: data[i][16], async2_score: data[i][17],
        pendalaman_status: data[i][18], pendalaman_score: data[i][19]
      });
    }
  }
  
  return daftarPeserta;
}

// Fungsi Ambil Data Monitoring (Telah difilter)
function getMonitoringInstruktur(kelasArray) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Database');
  const data = sheet.getDataRange().getValues();
  
  let stats = {
    PRETEST: { sudah: 0, belum: 0 },
    POST_TEST: { sudah: 0, belum: 0 },
    ASYNC_1: { sudah: 0, belum: 0 },
    ASYNC_2: { sudah: 0, belum: 0 },
    PENDALAMAN: { sudah: 0, belum: 0 }
  };

  for (let i = 1; i < data.length; i++) {
    // ASUMSI: Kolom Kelas Peserta di Database ada di Kolom J (Indeks 9)
    // Silakan ubah angka 9 jika kolom kelas ada di tempat lain
    let kelasPeserta = data[i][9] ? data[i][9].toString().trim() : ""; 
    
    // Hanya hitung jika kelas peserta termasuk dalam kelas yang diampu instruktur
    if (kelasArray.includes(kelasPeserta)) {
      if (data[i][10] === "Used") stats.PRETEST.sudah++; else stats.PRETEST.belum++;
      if (data[i][12] === "Used") stats.POST_TEST.sudah++; else stats.POST_TEST.belum++;
      if (data[i][14] === "Used") stats.ASYNC_1.sudah++; else stats.ASYNC_1.belum++;
      if (data[i][16] === "Used") stats.ASYNC_2.sudah++; else stats.ASYNC_2.belum++;
      if (data[i][18] === "Used") stats.PENDALAMAN.sudah++; else stats.PENDALAMAN.belum++;
    }
  }
  
  return stats;
}

// Fungsi untuk memvalidasi password monitoring
function cekPasswordMonitoring(inputPassword) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  const data = sheet.getDataRange().getValues();
  
  // Mencari password di sheet config
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === 'MONITOR_PASSWORD') {
      return data[i][1].toString() === inputPassword;
    }
  }
  return false;
}

function validasiLogin(nama, idSobat, quizKey) {
  const sheetConfig = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  const config = sheetConfig.getDataRange().getValues().reduce((obj, row) => {
    obj[row[0]] = row[1];
    return obj;
  }, {});

  // 1. Validasi Waktu
  const now = new Date();
  const openDate = new Date(config.ASYNC_1_OPEN_DATE);
  const closeDate = new Date(config.ASYNC_1_CLOSE_DATE);

  if (now < openDate) return { success: false, message: "Kuis belum dibuka!" };
  if (now > closeDate) return { success: false, message: "Kuis sudah ditutup!" };

  // 2. Validasi Gelombang (Di Database Kolom I = Indeks 8)
  const sheetDb = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Database');
  const dataDb = sheetDb.getDataRange().getValues();
  const userRow = dataDb.find(row => row[1] == idSobat); // Cari berdasarkan ID Sobat

  if (!userRow) return { success: false, message: "ID SOBAT tidak ditemukan." };

  const gelombangPeserta = userRow[8] ? userRow[8].toString().trim() : "";
  const allowedGelombang = config.ALLOWED_GELOMBANG.split(',').map(g => g.trim());

  // Validasi kecocokan teks
  if (!allowedGelombang.includes(gelombangPeserta)) {
    return { 
      success: false, 
      message: "Gelombang Anda (" + gelombangPeserta + ") tidak diizinkan mengakses kuis ini." 
    };
  }

  // Jika semua lolos, jalankan logika login Anda sebelumnya (cek status 'Used', dll)
  return { success: true };
}

function simpanJawabanAsync1(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const map = CONFIG.QUIZ['ASYNC_1'];
  const sheetResp = ss.getSheetByName(map.tabResponse);
  const sheetDb = ss.getSheetByName(CONFIG.DB_SHEET);   
  
  // 1. Siapkan baris array: 5 metadata + 29 soal
  // Metadata: [0]Timestamp, [1]Reason, [2]Nama, [3]ID, [4]Skor
  let rowData = new Array(5 + map.totalSoal).fill(""); 
  
  rowData[0] = new Date();
  rowData[1] = payload.reason;
  rowData[2] = payload.nama;
  rowData[3] = payload.idSobat;
  rowData[4] = "Menunggu Penilaian"; 
  
  // 2. Masukkan Jawaban
  // Q1-Q19 (Keluarga) tetap masuk seperti biasa
  // Q20-Q29 (Usaha) akan masuk dengan format "Nama|Kegiatan|Kategori|KBLI"
  for (let key in payload.answers) {
    let qNum = parseInt(key); // 1 sampai 29
    let colIndex = 4 + qNum;  // Key 1 masuk index 5, dst
    
    if(colIndex < rowData.length) {
      rowData[colIndex] = payload.answers[key];
    }
  }
  
  // 3. Simpan ke Resp_ASYNC_1
  sheetResp.appendRow(rowData);
  
  // 4. Kunci Akses di Database (Status menjadi 'Used')
  const dbData = sheetDb.getDataRange().getValues();
  for (let i = 1; i < dbData.length; i++) {
    // Memastikan pencocokan ID aman dari spasi berlebih
    if (dbData[i][1].toString().trim() === payload.idSobat.toString().trim()) {
      sheetDb.getRange(i + 1, map.statusIdx + 1).setValue("Used");
      break;
    }
  }
  return true;
}


function getMonitoringData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Database');
  const data = sheet.getDataRange().getValues();
  
  // Mapping indeks kolom status sesuai database baru Anda:
  // Kolom K(10), M(12), O(14), Q(16), S(18)
  let stats = {
    PRETEST: { sudah: 0, belum: 0 },
    POST_TEST: { sudah: 0, belum: 0 },
    ASYNC_1: { sudah: 0, belum: 0 },
    ASYNC_2: { sudah: 0, belum: 0 },
    PENDALAMAN: { sudah: 0, belum: 0 }
  };

  for (let i = 1; i < data.length; i++) {
    if (data[i][10] === "Used") stats.PRETEST.sudah++; else stats.PRETEST.belum++;
    if (data[i][12] === "Used") stats.POST_TEST.sudah++; else stats.POST_TEST.belum++;
    if (data[i][14] === "Used") stats.ASYNC_1.sudah++; else stats.ASYNC_1.belum++;
    if (data[i][16] === "Used") stats.ASYNC_2.sudah++; else stats.ASYNC_2.belum++;
    if (data[i][18] === "Used") stats.PENDALAMAN.sudah++; else stats.PENDALAMAN.belum++;
  }
  return stats;
}