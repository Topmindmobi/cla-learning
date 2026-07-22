(() => {
  const sql = atob(window.__sqlParts.join(''));
  const ed = window.monaco?.editor?.getEditors?.()?.[0];
  if (!ed) return { ok:false, reason:'no-editor' };
  ed.setValue(sql);
  return { ok:true, len: sql.length, preview: sql.slice(0,40) };
})()