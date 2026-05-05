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
`;

const SC = {
  [ST.R]: { c:'var(--recv-c)', bg:'var(--recv-bg)' },
  [ST.C]: { c:'var(--ready-c)', bg:'var(--ready-bg)' },
  [ST.A]: { c:'var(--asgn-c)', bg:'var(--asgn-bg)' },
  [ST.D]: { c:'var(--del-c)', bg:'var(--del-bg)' },
};

function fmt(d) {
  if (!d) return '—';
  try { const [y,m,day]=d.split('-'); return `${m}/${day}/${y.slice(2)}`; } catch { return d; }
}

let _uid = 600;
function uid() { return `u${++_uid}`; }

function Lbl({children}) {
  return <div style={{fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--txts)',marginBottom:5}}>{children}</div>;
}

function ModalWrap({onClose, children}) {
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16}}>
      <div style={{background:'var(--surf)',border:'1px solid var(--bdr2)',borderRadius:12,padding:24,width:'100%',maxWidth:400,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        {children}
      </div>
    </div>
  );
}

function ModalActions({onCancel, onSave, saveLabel, disabled}) {
  return (
    <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
      <button onClick={onCancel}
        style={{padding:'8px 14px',border:'1px solid var(--bdr2)',borderRadius:6,background:'transparent',color:'var(--txts)',fontSize:13,cursor:'pointer'}}>
        Cancel
      </button>
      <button onClick={onSave} disabled={disabled}
        style={{padding:'8px 16px',border:'none',borderRadius:6,background:disabled?'var(--surf3)':'var(--acc)',color:disabled?'var(--txtm)':'#fff',fontSize:13,fontWeight:600,cursor:disabled?'default':'pointer'}}>
        {saveLabel}
      </button>
    </div>
  );
}

function ActBtn({label, c, bg, bdr, onClick}) {
  return (
    <button className="pill-btn" onClick={onClick}
      style={{padding:'3px 9px',borderRadius:5,border:`1px solid ${bdr||c+'44'}`,background:bg,color:c,fontSize:11,fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'}}>
      {label}
    </button>
  );
}

export default function App() {
  const [collars, setCollars] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arch, setArch] = useState(false);
  const [fType, setFType] = useState('');
  const [fTrn, setFTrn] = useState('');
  const [fSt, setFSt] = useState('');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [sortCol, setSortCol] = useState('type');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const loadCollars = useCallback(async () => {
    try {
      const res = await fetch('/api/collars');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCollars(data); setError(null);
    } catch (e) { setError('Could not connect to server.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCollars(); }, [loadCollars]);

  function toggleSort(col) {
    setSortCol(col);
    setSortDir(prev => col === sortCol && prev === 'asc' ? 'desc' : 'asc');
  }

  const stats = useMemo(() => {
    if (!collars) return { avail:0, assigned:0, received:0, byType:{} };
    const avail = collars.filter(c=>c.status===ST.C);
    return {
      avail: avail.length,
      assigned: collars.filter(c=>c.status===ST.A).length,
      received: collars.filter(c=>c.status===ST.R).length,
      byType: Object.fromEntries(TYPES.map(t=>[t, avail.filter(c=>c.type===t).length])),
    };
  }, [collars]);

  const rows = useMemo(() => {
    if (!collars) return [];
    const TYPE_ORDER = Object.fromEntries(TYPES.map((t,i)=>[t,i]));
    const STATUS_ORDER = Object.fromEntries(Object.values(ST).map((s,i)=>[s,i]));
    const filtered = collars.filter(c => {
      if (!arch && c.status===ST.D) return false;
      if (fType && c.type!==fType) return false;
      if (fTrn && c.trainer!==fTrn) return false;
      if (fSt && c.status!==fSt) return false;
      if (q) { const s=q.toLowerCase(); if (!c.serial.includes(s) && !c.client.toLowerCase().includes(s)) return false; }
      return true;
    });
    const dir = sortDir==='asc' ? 1 : -1;
    return [...filtered].sort((a,b) => {
      if (sortCol==='type')    return dir * ((TYPE_ORDER[a.type]??99)-(TYPE_ORDER[b.type]??99));
      if (sortCol==='status')  return dir * ((STATUS_ORDER[a.status]??99)-(STATUS_ORDER[b.status]??99));
      if (sortCol==='date')    return dir * (a.date||'').localeCompare(b.date||'');
      if (sortCol==='client')  return dir * (a.client||'').localeCompare(b.client||'');
      if (sortCol==='trainer') return dir * (a.trainer||'').localeCompare(b.trainer||'');
      return dir * a.serial.localeCompare(b.serial);
    });
  }, [collars, arch, fType, fTrn, fSt, q, sortCol, sortDir]);

  async function doAdd() {
    const s = (form.serial||'').trim();
    if (!s) return;
    if (collars.some(c=>c.serial===s)) { alert(`Serial #${s} already exists.`); return; }
    try {
      const res = await fetch('/api/collars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: uid(), serial: s, type: form.type||'Micro' }),
      });
      if (!res.ok) throw new Error();
      await loadCollars(); setModal(null); setForm({});
    } catch { alert('Failed to add collar. Try again.'); }
  }

  async function doReady(id) {
    try {
      await fetch(`/api/collars/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:ST.C,client:'',date:'',trainer:''}) });
      await loadCollars();
    } catch { alert('Failed to update. Try again.'); }
  }

  function openAssign(col) {
    setForm({ client:col.client||'', date:col.date||'', trainer:col.trainer||'' });
    setModal({ k:'assign', id:col.id, serial:col.serial, type:col.type, isEdit:col.status===ST.A });
  }

  async function doAssign() {
    const cl = (form.client||'').trim();
    if (!cl || !form.trainer) return;
    try {
      await fetch(`/api/collars/${modal.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:ST.A,client:cl,date:form.date||'',trainer:form.trainer}) });
      await loadCollars(); setModal(null);
    } catch { alert('Failed to assign. Try again.'); }
  }

  async function doDelete(id) {
    try {
      await fetch(`/api/collars/${id}`, { method: 'DELETE' });
      await loadCollars(); setModal(null);
    } catch { alert('Failed to delete. Try again.'); }
  }

  async function doDeliver(id) {
    try {
      await fetch(`/api/collars/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:ST.D,client:collars.find(c=>c.id===id)?.client||'',date:collars.find(c=>c.id===id)?.date||'',trainer:collars.find(c=>c.id===id)?.trainer||''}) });
      await loadCollars(); setModal(null);
    } catch { alert('Failed to deliver. Try again.'); }
  }

  const inpStyle = {width:'100%',background:'var(--surf2)',border:'1px solid var(--bdr2)',borderRadius:6,color:'var(--txt)',padding:'7px 10px',fontSize:13,fontFamily:'system-ui'};
  const hasAvail = TYPES.some(t=>(stats.byType[t]||0)>0);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'var(--txts)',fontSize:13}}>Loading inventory…</div>;
  if (error)   return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'#f87171',fontSize:13}}>{error}</div>;

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div style={{position:'sticky',top:0,zIndex:20,background:'var(--surf)',borderBottom:'1px solid var(--bdr)',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:'var(--acc)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🐾</div>
          <div>
            <div style={{fontWeight:600,fontSize:14,color:'var(--txt)'}}>Collar Inventory</div>
            <div style={{fontSize:11,color:'var(--txts)'}}>Dog Owners Academy</div>
          </div>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          {[{label:'Available',val:stats.avail,c:'var(--ready-c)'},{label:'Assigned',val:stats.assigned,c:'var(--asgn-c)'},...(stats.received>0?[{label:'Received',val:stats.received,c:'var(--recv-c)'}]:[])].map(s=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,background:'var(--surf2)',border:'1px solid var(--bdr)'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:s.c,display:'inline-block',flexShrink:0}}/>
              <span style={{fontSize:12,color:'var(--txts)'}}>{s.label}</span>
              <strong style={{fontSize:13,color:s.c}}>{s.val}</strong>
            </div>
          ))}
        </div>
        <button onClick={()=>{setForm({serial:'',type:'Micro'});setModal({k:'add'});}}
          style={{padding:'8px 14px',background:'var(--acc)',color:'#fff',border:'none',borderRadius:7,fontWeight:600,fontSize:13,cursor:'pointer'}}>
          + Add Collar
        </button>
      </div>

      <div style={{padding:'12px 20px 32px'}}>
        {hasAvail && (
          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center',marginBottom:10}}>
            <span style={{fontSize:11,color:'var(--txtm)',textTransform:'uppercase',letterSpacing:'0.05em',marginRight:2}}>Available:</span>
            {TYPES.filter(t=>(stats.byType[t]||0)>0||fType===t).map(t=>{
              const on=fType===t;
              return <button key={t} className="pill-btn" onClick={()=>setFType(on?'':t)}
                style={{padding:'3px 10px',borderRadius:5,fontSize:12,fontWeight:500,cursor:'pointer',border:`1px solid ${on?'var(--acc)':'var(--bdr2)'}`,background:on?'var(--acc-dim)':'transparent',color:on?'var(--acc)':'var(--txts)'}}>
                {t}&nbsp;<strong style={{color:on?'var(--acc)':'var(--txt)'}}>{stats.byType[t]||0}</strong>
              </button>;
            })}
          </div>
        )}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:12}}>
          <input placeholder="Search serial # or client…" value={q} onChange={e=>setQ(e.target.value)} style={{...inpStyle,width:210}}/>
          <select value={fSt} onChange={e=>setFSt(e.target.value)} style={{...inpStyle,width:'auto',cursor:'pointer'}}>
            <option value=''>All Statuses</option>
            {Object.values(ST).map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={fTrn} onChange={e=>setFTrn(e.target.value)} style={{...inpStyle,width:'auto',cursor:'pointer'}}>
            <option value=''>All Trainers</option>
            {TRAINERS.map(t=><option key={t}>{t}</option>)}
          </select>
          <label style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:12,color:'var(--txts)',marginLeft:'auto',userSelect:'none'}}>
            <input type="checkbox" checked={arch} onChange={e=>setArch(e.target.checked)} style={{accentColor:'var(--acc)',width:'auto',cursor:'pointer'}}/>
            Show Delivered
          </label>
          <span style={{fontSize:11,color:'var(--txtm)'}}>{rows.length} shown</span>
        </div>
        <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:10,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
              <thead>
                <tr style={{background:'var(--surf2)',borderBottom:'1px solid var(--bdr)'}}>
                  {[{h:'Serial #',k:'serial'},{h:'Type',k:'type'},{h:'Status',k:'status'},{h:'Client',k:'client'},{h:'Appt Date',k:'date'},{h:'Trainer',k:'trainer'},{h:'',k:null}].map(({h,k})=>(
                    <th key={h} onClick={k?()=>toggleSort(k):undefined}
                      style={{padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap',cursor:k?'pointer':'default',userSelect:'none',color:sortCol===k?'var(--acc)':'var(--txtm)'}}>
                      {h}{k && sortCol===k ? (sortDir==='asc' ? ' ↑' : ' ↓') : (k ? ' ↕' : '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length===0 ? (
                  <tr><td colSpan={7} style={{textAlign:'center',padding:'44px 20px',color:'var(--txtm)',fontSize:13}}>No collars match your filters</td></tr>
                ) : rows.map((col,i)=>{
                  const ss=SC[col.status]; const isEven=i%2===0;
                  return (
                    <tr key={col.id} className="trow" style={{borderBottom:'1px solid var(--bdr)'}}>
                      <td style={{padding:'9px 12px',background:isEven?'var(--surf)':'var(--surf2)'}} className="mono"><span style={{fontSize:13,color:'var(--txt)'}}>{col.serial}</span></td>
                      <td style={{padding:'9px 12px',background:isEven?'var(--surf)':'var(--surf2)',color:'var(--txts)',fontSize:13,whiteSpace:'nowrap'}}>{col.type}</td>
                      <td style={{padding:'9px 12px',background:isEven?'var(--surf)':'var(--surf2)'}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:5,background:ss.bg,color:ss.c,fontSize:12,fontWeight:500,whiteSpace:'nowrap'}}>
                          <span style={{width:5,height:5,borderRadius:'50%',background:ss.c,flexShrink:0}}/>{col.status}
                        </span>
                      </td>
                      <td style={{padding:'9px 12px',background:isEven?'var(--surf)':'var(--surf2)',color:col.client?'var(--txt)':'var(--txtm)',fontSize:13,maxWidth:170,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{col.client||'—'}</td>
                      <td style={{padding:'9px 12px',background:isEven?'var(--surf)':'var(--surf2)',fontSize:13,whiteSpace:'nowrap',fontFamily:col.date?`'IBM Plex Mono',monospace`:'inherit',color:col.date?'var(--txts)':'var(--txtm)'}}>{fmt(col.date)}</td>
                      <td style={{padding:'9px 12px',background:isEven?'var(--surf)':'var(--surf2)',color:col.trainer?'var(--txts)':'var(--txtm)',fontSize:13}}>{col.trainer||'—'}</td>
                      <td style={{padding:'9px 12px',background:isEven?'var(--surf)':'var(--surf2)'}}>
                        <div style={{display:'flex',gap:5}}>
                          {col.status===ST.R && <ActBtn label="Mark Ready" c="var(--ready-c)" bg="var(--ready-bg)" onClick={()=>doReady(col.id)}/>}
                          {col.status===ST.C && <ActBtn label="Assign →" c="var(--asgn-c)" bg="var(--asgn-bg)" onClick={()=>openAssign(col)}/>}
                          {col.status===ST.A && <>
                            <ActBtn label="Edit" c="var(--txts)" bg="var(--surf2)" bdr="var(--bdr2)" onClick={()=>openAssign(col)}/>
                            <ActBtn label="Deliver ✓" c="var(--ready-c)" bg="var(--ready-bg)" onClick={()=>setModal({k:'deliver',id:col.id,serial:col.serial,client:col.client})}/>
                          </>}
                          {col.status!==ST.D && <ActBtn label="✕" c="#ef4444" bg="rgba(239,68,68,0.08)" bdr="rgba(239,68,68,0.3)" onClick={()=>setModal({k:'delete',id:col.id,serial:col.serial})}/>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal?.k==='add' && (
        <ModalWrap onClose={()=>setModal(null)}>
          <div style={{fontWeight:600,fontSize:15,color:'var(--txt)',marginBottom:16}}>Add New Collar</div>
          <div style={{marginBottom:14}}>
            <Lbl>Serial #</Lbl>
            <input className="mono" value={form.serial||''} onChange={e=>setForm(f=>({...f,serial:e.target.value}))}
              placeholder="Enter serial number" style={inpStyle} autoFocus onKeyDown={e=>{if(e.key==='Enter')doAdd();}}/>
          </div>
          <div style={{marginBottom:14}}>
            <Lbl>Type</Lbl>
            <select value={form.type||'Micro'} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={inpStyle}>
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <ModalActions onCancel={()=>setModal(null)} onSave={doAdd} saveLabel="Add Collar" disabled={!(form.serial||'').trim()}/>
        </ModalWrap>
      )}

      {modal?.k==='assign' && (
        <ModalWrap onClose={()=>setModal(null)}>
          <div style={{fontWeight:600,fontSize:15,color:'var(--txt)',marginBottom:4}}>{modal.isEdit?'Edit Assignment':'Assign Collar'}</div>
          <div className="mono" style={{fontSize:12,color:'var(--txts)',marginBottom:16}}>#{modal.serial} · {modal.type}</div>
          <div style={{marginBottom:14}}>
            <Lbl>Client Name</Lbl>
            <input value={form.client||''} onChange={e=>setForm(f=>({...f,client:e.target.value}))} placeholder="Last, First" style={inpStyle} autoFocus/>
          </div>
          <div style={{marginBottom:14}}>
            <Lbl>Appointment Date</Lbl>
            <input type="date" value={form.date||''} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inpStyle}/>
          </div>
          <div style={{marginBottom:14}}>
            <Lbl>Trainer</Lbl>
            <select value={form.trainer||''} onChange={e=>setForm(f=>({...f,trainer:e.target.value}))} style={inpStyle}>
              <option value=''>Select trainer…</option>
              {TRAINERS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <ModalActions onCancel={()=>setModal(null)} onSave={doAssign} saveLabel="Save" disabled={!(form.client||'').trim()||!form.trainer}/>
        </ModalWrap>
      )}

      {modal?.k==='deliver' && (
        <ModalWrap onClose={()=>setModal(null)}>
          <div style={{fontWeight:600,fontSize:15,color:'var(--txt)',marginBottom:10}}>Mark as Delivered?</div>
          <p style={{fontSize:13,color:'var(--txts)',lineHeight:1.6,marginBottom:4}}>
            Collar <span className="mono" style={{color:'var(--txt)',fontSize:12}}>{modal.serial}</span> → <strong style={{color:'var(--txt)'}}>{modal.client}</strong> will be archived.
          </p>
          <p style={{fontSize:12,color:'var(--txtm)',marginBottom:0}}>This can't be undone.</p>
          <ModalActions onCancel={()=>setModal(null)} onSave={()=>doDeliver(modal.id)} saveLabel="Deliver ✓"/>
        </ModalWrap>
      )}

      {modal?.k==='delete' && (
        <ModalWrap onClose={()=>setModal(null)}>
          <div style={{fontWeight:600,fontSize:15,color:'#ef4444',marginBottom:10}}>Delete Collar?</div>
          <p style={{fontSize:13,color:'var(--txts)',lineHeight:1.6,marginBottom:4}}>
            Serial <span className="mono" style={{color:'var(--txt)',fontSize:12}}>{modal.serial}</span> will be permanently removed from inventory.
          </p>
          <p style={{fontSize:12,color:'var(--txtm)',marginBottom:0}}>This cannot be undone.</p>
          <ModalActions onCancel={()=>setModal(null)} onSave={()=>doDelete(modal.id)} saveLabel="Delete"/>
        </ModalWrap>
      )}

    </div>
  );
}
