"use client";
import { useEffect, useState } from "react";

export default function AdminEvaluasiPage() {
  const [frameUrl, setFrameUrl] = useState<string>("");

  useEffect(() => {
    // URL CSV pancingan Anda
    fetch("LINK_CSV_PANCINGAN_ANDA_DISINI")
      .then((res) => res.text())
      .then((csvText) => {
        const rows = csvText.split("\n");
        const baseScriptUrl = rows[1]?.split(",")[0]?.trim(); 
        if (baseScriptUrl) {
          // 🟢 TEMBAK KE RUTE BARU ADMIN
          setFrameUrl(`${baseScriptUrl}?page=adminevaluasi`); 
        }
      });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, backgroundColor: "#0f172a" }}>
      {frameUrl ? (
        <iframe
          src={frameUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
        />
      ) : (
        <div style={{ padding: "30px", fontFamily: "sans-serif", color: "#64748b", textAlign: "center" }}>
          Membuka Panel Evaluasi...
        </div>
      )}
    </div>
  );
}