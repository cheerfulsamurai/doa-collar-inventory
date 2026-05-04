import { useState, useEffect, useMemo, useCallback } from "react";


const TYPES = ['Micro','Standard','2 Dog Micro','2 Dog Standard','Boss'];
const TRAINERS = ['Dom','Amya','Turk'];
const ST = { R:'Received', C:'Client Ready', A:'Assigned to Client', D:'Delivered' };


const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#f0f2f5;--surf:#fff;--surf2:#f6f7f9;--surf3:#eef0f3;
    --bdr:rgba(0,0,0,0.08);--bdr2:rgba(0,0,0,0.13);
    --txt:#0f172a;--txts:#5a6a85;--txtm:#aab0bf;
    --acc:#f97316;--acc-dim:rgba(249,115,22,0.1);
    --recv-c:#1d6fb8;--recv-bg:rgba(29,111,184,0.09);
    --ready-c:#16803d;--ready-bg:rgba(22,128,61,0.09);
    --asgn-c:#c2410c;--asgn-bg:rgba(194,65,12,0.09);
    --del-c:#94a3b8;--del-bg:rgba(148,163,184,0.07);
  }
  @media(prefers-color-scheme:dark){:root{
    --bg:#0d1117;--surf:#161b22;--surf2:#1e242d;--surf3:#262d38;
    --bdr:rgba(255,255,255,0.07);--bdr2:rgba(255,255,255,0.13);
    --txt:#e6edf3;--txts:#8b949e;--txtm:#4a5568;
    --recv-c:#60a5fa;--recv-bg:rgba(96,165,250,0.1);
    --ready-c:#4ade80;--ready-bg:rgba(74,222,128,0.1);
    --asgn-c:#fb923c;--asgn-bg:rgba(251,146,60,0.1);
    --del-c:#4a5568;--del-bg:rgba(74,85,104,0.08);
  }}
  body{background:var(--bg);color:var(--txt);font-family:system-ui,-apple-system,sans-serif;font-size:14px}
  input,select{font-family:inherit;font-size:13px;color:var(--txt);background:var(--surf2);border:1px solid var(--bdr2);border-radius:6px;padding:7px 10px;outline:none;transition:border-color 0.15s}
  input:focus,select:focus{border-color:var(--acc)}
  select option{background:var(--surf)}
  input[type=date]::-webkit-calendar-picker-indicator{opacity:0.35;cursor:pointer}
  .mono{font-family:'IBM Plex Mono',monospace!important}
  tr.trow:hover td{background:var(--surf2)!important}
  .pill-btn:hover{filter:brightness(1.07)}
