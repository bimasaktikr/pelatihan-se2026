"use client";
import { useEffect, useState } from "react";

export default function PortalInstruktur() {
  const [url, setUrl] = useState("");
  useEffect(() => {
    // Ambil URL /exec dari Spreadsheet Config Anda
    fetch("LINK_CSV_MASTER_ANDA")
      .then(res => res.text())
      .then(csv => {
        const gasExecUrl = csv.split('\n')[1].split(',')[1].trim();
        setUrl(`${gasExecUrl}?page=portalinstruktur`);
      });
  }, []);

  return (
    <iframe src={url} className="w-full h-screen border-0" allowFullScreen />
  );
}