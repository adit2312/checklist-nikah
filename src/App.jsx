import { useState, useEffect, useMemo, useCallback } from "react";

/**
 * Checklist Pernikahan — dipisah antara yang butuh anggaran & yang tidak
 * File ini bagian dari project Vite, dipanggil dari src/main.jsx.
 * Tombol "Simpan" pakai localStorage browser — aktif penuh setelah di-deploy ke Vercel.
 */

const STORAGE_KEY = "wedding-checklist-v2";

const BUDGET_GROUPS = [
  {
    name: "Venue & transportasi",
    items: [
      { t: "Sewa venue akad + resepsi", note: "Satu hari, dua sesi" },
      { t: "Mobil pengantin / transportasi" },
    ],
  },
  {
    name: "Vendor",
    items: [
      { t: "Wedding organizer (WO) / EO" },
      { t: "Catering", note: "Termasuk food tasting" },
      { t: "Dekorasi & pelaminan" },
      { t: "Fotografer & videografer" },
      { t: "MUA (make-up artist)", note: "Termasuk trial makeup" },
      { t: "MC & pengisi acara", note: "Band, organ tunggal, dll" },
    ],
  },
  {
    name: "Baju",
    items: [
      { t: "Baju pengantin akad" },
      { t: "Baju pengantin resepsi" },
    ],
  },
  {
    name: "Undangan & keuangan",
    items: [
      { t: "Cetak undangan fisik" },
      { t: "Souvenir" },
      { t: "Mahar / mas kawin" },
      { t: "Amplop tip vendor & among tamu" },
    ],
  },
];

const TASK_GROUPS = [
  {
    name: "Venue & acara",
    items: [
      { t: "Tentukan tanggal pernikahan" },
      { t: "Susun rundown acara akad + resepsi" },
    ],
  },
  {
    name: "Dokumen & administrasi",
    items: [
      { t: "Siapkan KTP, KK, akta kelahiran" },
      { t: "Surat pengantar RT/RW & surat N1–N4 dari kelurahan" },
      { t: "Surat izin orang tua", note: "Kalau calon pengantin di bawah 21 tahun" },
      { t: "Surat pindah nikah", note: "Kalau calon pengantin beda domisili" },
      { t: "Ikut bimbingan / kursus pranikah" },
    ],
  },
  {
    name: "Penampilan",
    items: [{ t: "Fitting baju" }],
  },
  {
    name: "Undangan & tamu",
    items: [
      { t: "Desain undangan" },
      { t: "Sebar undangan digital" },
      { t: "Finalisasi guest list & seating VIP" },
    ],
  },
];

function parseDigits(str) {
  const digits = String(str).replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatRupiah(n) {
  if (!n) return "";
  return new Intl.NumberFormat("id-ID").format(n);
}

function countItems(groups) {
  return groups.reduce((sum, g) => sum + g.items.length, 0);
}

export default function WeddingChecklist() {
  const [checked, setChecked] = useState({});
  const [budgets, setBudgets] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setChecked(parsed.checked || {});
        setBudgets(parsed.budgets || {});
        setLastSaved(parsed.savedAt || null);
      }
    } catch {
      // penyimpanan browser tidak tersedia, lanjut pakai memory saja
    }
  }, []);

  const toggle = (key) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const setBudget = (key, value) =>
    setBudgets((prev) => ({ ...prev, [key]: parseDigits(value) }));

  const handleSave = useCallback(() => {
    const savedAt = new Date().toISOString();
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ checked, budgets, savedAt })
      );
      setLastSaved(savedAt);
      setSaveState("ok");
    } catch {
      setSaveState("blocked");
    }
  }, [checked, budgets]);

  const stats = useMemo(() => {
    let budgetDone = 0;
    let budgetSum = 0;
    BUDGET_GROUPS.forEach((g, gi) =>
      g.items.forEach((_, ii) => {
        const key = `b-${gi}-${ii}`;
        if (checked[key]) budgetDone += 1;
        budgetSum += budgets[key] || 0;
      })
    );
    let taskDone = 0;
    TASK_GROUPS.forEach((g, gi) =>
      g.items.forEach((_, ii) => {
        const key = `t-${gi}-${ii}`;
        if (checked[key]) taskDone += 1;
      })
    );
    const budgetTotal = countItems(BUDGET_GROUPS);
    const taskTotal = countItems(TASK_GROUPS);
    return {
      budgetDone,
      budgetTotal,
      budgetSum,
      taskDone,
      taskTotal,
      overallDone: budgetDone + taskDone,
      overallTotal: budgetTotal + taskTotal,
    };
  }, [checked, budgets]);

  const overallPct = stats.overallTotal
    ? Math.round((stats.overallDone / stats.overallTotal) * 100)
    : 0;

  return (
    <div className="wc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        .wc-root {
          --paper: #F7F4EE;
          --panel: #FFFFFF;
          --ink: #241C16;
          --muted: #857A6B;
          --gold: #A8791E;
          --gold-bg: #FBF1DC;
          --gold-line: #E7CE9C;
          --sage: #435840;
          --sage-bg: #EEF2EA;
          --sage-line: #CBD9C4;
          --line: #E4DED2;
          font-family: 'Inter', sans-serif;
          background: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          padding: 28px 16px 60px;
          box-sizing: border-box;
        }
        .wc-root * { box-sizing: border-box; }
        .wc-wrap { max-width: 900px; margin: 0 auto; }

        .wc-title {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: clamp(26px, 5.5vw, 34px);
          line-height: 1.15;
          margin: 0 0 4px;
        }
        .wc-subtitle {
          font-size: 13.5px;
          color: var(--muted);
          margin: 0 0 22px;
        }

        .wc-overall {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
        }
        .wc-overall-track {
          flex: 1;
          height: 5px;
          background: var(--line);
          border-radius: 3px;
          overflow: hidden;
        }
        .wc-overall-fill {
          height: 100%;
          background: var(--ink);
          transition: width 0.3s ease;
        }
        .wc-overall-text {
          font-size: 12.5px;
          color: var(--muted);
          white-space: nowrap;
        }

        .wc-columns {
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
        }
        @media (min-width: 760px) {
          .wc-columns { grid-template-columns: 1.15fr 1fr; align-items: start; }
        }

        .wc-section {
          border-radius: 8px;
          padding: 18px 18px 6px;
          border: 1px solid var(--line);
        }
        .wc-section.is-budget {
          background: var(--gold-bg);
          border-color: var(--gold-line);
        }
        .wc-section.is-task {
          background: var(--panel);
        }

        .wc-section-head {
          margin-bottom: 14px;
        }
        .wc-section-eyebrow {
          font-size: 12px;
          color: var(--muted);
          margin: 0 0 2px;
        }
        .wc-section-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          margin: 0;
        }
        .is-budget .wc-section-title { color: #7A5A12; }
        .is-task .wc-section-title { color: var(--sage); }

        .wc-section-total {
          font-family: 'Fraunces', serif;
          font-size: 24px;
          margin-top: 6px;
          color: #7A5A12;
        }
        .wc-section-count {
          font-size: 12px;
          color: var(--muted);
        }

        .wc-group { margin-bottom: 6px; }
        .wc-group-name {
          font-size: 12px;
          color: var(--muted);
          margin: 14px 0 2px;
        }

        .wc-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 11px 0;
          border-top: 1px solid rgba(0,0,0,0.06);
        }
        .wc-group:first-child .wc-item:first-child { border-top: none; }

        .wc-checkbox {
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
          margin-top: 2px;
          border: 1.5px solid var(--muted);
          border-radius: 3px;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .is-budget .wc-checkbox.is-checked { background: var(--gold); border-color: var(--gold); }
        .is-task .wc-checkbox.is-checked { background: var(--sage); border-color: var(--sage); }

        .wc-item-body {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 6px 12px;
          align-items: baseline;
          justify-content: space-between;
        }
        .wc-item-text { flex: 1 1 140px; min-width: 0; }
        .wc-item-title { font-size: 14px; line-height: 1.4; }
        .wc-item-title.is-done { color: var(--muted); text-decoration: line-through; }
        .wc-item-note { font-size: 11.5px; color: var(--muted); margin-top: 2px; line-height: 1.5; }

        .wc-budget-field {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .wc-budget-field span { font-size: 12.5px; color: var(--muted); }
        .wc-budget-field input {
          width: 96px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          text-align: right;
          border: 1px solid var(--gold-line);
          border-radius: 3px;
          padding: 5px 7px;
          color: var(--ink);
          background: #fff;
        }
        .wc-budget-field input:focus { outline: none; border-color: var(--gold); }

        .wc-save-bar {
          position: sticky;
          bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 12px 16px;
          margin-top: 24px;
          box-shadow: 0 4px 18px rgba(36,28,22,0.08);
        }
        .wc-save-btn {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: var(--ink);
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          cursor: pointer;
        }
        .wc-save-status { font-size: 12.5px; color: var(--muted); }
      `}</style>

      <div className="wc-wrap">
        <h1 className="wc-title">Checklist Pernikahan</h1>
        <p className="wc-subtitle">Yang butuh anggaran dan yang enggak, dipisah biar jelas.</p>

        <div className="wc-overall">
          <div className="wc-overall-track">
            <div className="wc-overall-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="wc-overall-text">{stats.overallDone}/{stats.overallTotal} selesai · {overallPct}%</span>
        </div>

        <div className="wc-columns">
          <div className="wc-section is-budget">
            <div className="wc-section-head">
              <p className="wc-section-eyebrow">Yang ada anggaran</p>
              <h2 className="wc-section-title">Perlu biaya</h2>
              <div className="wc-section-total">Rp{formatRupiah(stats.budgetSum) || "0"}</div>
              <div className="wc-section-count">{stats.budgetDone}/{stats.budgetTotal} sudah diceklis</div>
            </div>

            {BUDGET_GROUPS.map((group, gi) => (
              <div className="wc-group" key={group.name}>
                <div className="wc-group-name">{group.name}</div>
                {group.items.map((item, ii) => {
                  const key = `b-${gi}-${ii}`;
                  const isDone = !!checked[key];
                  return (
                    <div className="wc-item" key={key}>
                      <button
                        className={`wc-checkbox ${isDone ? "is-checked" : ""}`}
                        onClick={() => toggle(key)}
                        aria-label={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                      >
                        {isDone && (
                          <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="wc-item-body">
                        <div className="wc-item-text">
                          <div className={`wc-item-title ${isDone ? "is-done" : ""}`}>{item.t}</div>
                          {item.note && <div className="wc-item-note">{item.note}</div>}
                        </div>
                        <div className="wc-budget-field">
                          <span>Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={formatRupiah(budgets[key])}
                            onChange={(e) => setBudget(key, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="wc-section is-task">
            <div className="wc-section-head">
              <p className="wc-section-eyebrow">Yang gak perlu anggaran</p>
              <h2 className="wc-section-title">Tinggal dikerjain</h2>
              <div className="wc-section-count" style={{ marginTop: 6 }}>{stats.taskDone}/{stats.taskTotal} sudah diceklis</div>
            </div>

            {TASK_GROUPS.map((group, gi) => (
              <div className="wc-group" key={group.name}>
                <div className="wc-group-name">{group.name}</div>
                {group.items.map((item, ii) => {
                  const key = `t-${gi}-${ii}`;
                  const isDone = !!checked[key];
                  return (
                    <div className="wc-item" key={key}>
                      <button
                        className={`wc-checkbox ${isDone ? "is-checked" : ""}`}
                        onClick={() => toggle(key)}
                        aria-label={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                      >
                        {isDone && (
                          <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="wc-item-body">
                        <div className="wc-item-text">
                          <div className={`wc-item-title ${isDone ? "is-done" : ""}`}>{item.t}</div>
                          {item.note && <div className="wc-item-note">{item.note}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="wc-save-bar">
          <button className="wc-save-btn" onClick={handleSave}>Simpan</button>
          <span className="wc-save-status">
            {saveState === "blocked"
              ? "Penyimpanan browser tidak tersedia di sini"
              : lastSaved
              ? `Tersimpan · ${new Date(lastSaved).toLocaleTimeString("id-ID")}`
              : "Belum disimpan"}
          </span>
        </div>
      </div>
    </div>
  );
}
