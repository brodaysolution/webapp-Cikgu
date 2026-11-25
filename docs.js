/* Penjana dokumen. Setiap fungsi pulangkan HTML satu atau lebih .page */
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const BULAN = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const HARI = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
function tarikhMs(iso, withDay) {
  if (!iso) return '__________';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return esc(iso);
  return (withDay ? HARI[d.getDay()] + ', ' : '') + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
}
const rm = n => 'RM ' + (Number(n) || 0).toLocaleString('ms-MY', {minimumFractionDigits:2, maximumFractionDigits:2});
const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
const num = v => parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')) || 0;
const rows = list => (list || []).filter(r => r.some(c => String(c || '').trim()));

function letterhead(S) {
  return `<div class="lh">${S.logo ? `<img src="${S.logo}" alt="">` : ''}
    <div><div class="name">${esc(S.nama || 'NAMA SEKOLAH')}</div>
    <div class="addr">${nl(S.alamat)}</div>
    <div class="addr">${[S.telefon && 'Tel: ' + esc(S.telefon), S.emel && 'E-mel: ' + esc(S.emel)].filter(Boolean).join(' &nbsp;|&nbsp; ')}</div></div></div>`;
}
function refBlock(S, P, suffix) {
  return `<div class="ref">Ruj. Kami : ${esc(P.rujFail || S.kodRujukan || '')}${suffix ? ' (' + suffix + ')' : ''}<br>
    Tarikh &nbsp;&nbsp;&nbsp;: ${tarikhMs(P.tarikhSurat)}</div>`;
}
function signBlock(S, opts = {}) {
  const nama = opts.nama || S.pengetua, jaw = opts.jawatan || S.jawatanPengetua || 'Pengetua';
  const sig = opts.useSig !== false && S.tandatangan ? `<img src="${S.tandatangan}" alt="">` : '<br><br><br>';
  return `<div class="sign">${esc(S.cogankata || '"BERKHIDMAT UNTUK NEGARA"')}<br><br>Saya yang menjalankan amanah,<br>
    ${sig}<div>................................................</div>
    <b>(${esc(nama || 'NAMA PENGETUA')})</b><br>${esc(jaw)}<br>${esc(S.nama || '')}</div>`;
}
const progInfo = P => `<table class="doc" style="width:auto;border:none">
  ${[['Tarikh', tarikhMs(P.tarikh, true)], ['Masa', esc(P.masa)], ['Tempat', esc(P.tempat)]]
    .map(([k, v]) => `<tr><td style="border:none;padding:1px 10px 1px 0">${k}</td><td style="border:none;padding:1px">: ${v}</td></tr>`).join('')}</table>`;

const DOCS = {
  kertasKerja: { tajuk: 'Kertas Kerja / Cadangan', gen(S, P) {
    const bajet = rows(P.bajet); let jum = 0;
    const bRows = bajet.map((r, i) => { const t = (+r[1] || 0) * (+r[2] || 0); jum += t;
      return `<tr><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td class="center">${esc(r[1])}</td><td style="text-align:right">${rm(r[2])}</td><td style="text-align:right">${rm(t)}</td></tr>`; }).join('');
    const ajk = rows(P.ajk);
    return `<div class="page">${letterhead(S)}
      <h1>KERTAS CADANGAN<br>${esc((P.nama || '').toUpperCase())}</h1>
      <h3>1.0 PENGENALAN / LATAR BELAKANG</h3><p>${nl(P.latar)}</p>
      <h3>2.0 OBJEKTIF</h3><ol>${lines(P.objektif).map(o => `<li>${esc(o)}</li>`).join('')}</ol>
      <h3>3.0 KUMPULAN SASARAN</h3><p>${nl(P.sasaran)}</p>
      <h3>4.0 TARIKH, MASA DAN TEMPAT</h3>${progInfo(P)}
      <h3>5.0 ANJURAN</h3><p>${esc(P.anjuran || S.nama)}</p>
      <h3>6.0 JAWATANKUASA PELAKSANA</h3>
      <table class="doc"><tr><th style="width:35%">Jawatan</th><th>Nama</th></tr>
      ${ajk.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
      <h3>7.0 ATUR CARA</h3>
      <table class="doc"><tr><th style="width:25%">Masa</th><th>Aktiviti</th></tr>
      ${rows(P.aturcara).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
      <h3>8.0 IMPLIKASI KEWANGAN</h3>
      <table class="doc"><tr><th>Bil</th><th>Perkara</th><th>Kuantiti</th><th>Harga Seunit</th><th>Jumlah</th></tr>
      ${bRows}<tr><th colspan="4" style="text-align:right">JUMLAH KESELURUHAN</th><th style="text-align:right">${rm(jum)}</th></tr></table>
      ${P.sumberKewangan ? `<p>Sumber kewangan: ${esc(P.sumberKewangan)}</p>` : ''}
      <h3>9.0 PENUTUP</h3><p>${nl(P.penutup || 'Adalah diharapkan kertas cadangan ini mendapat pertimbangan dan kelulusan daripada pihak pentadbir sekolah.')}</p>
      <table class="doc" style="margin-top:30px"><tr>
        <td style="width:50%;height:110px">Disediakan oleh:<br><br><br><br>.............................<br>(${esc(P.penyelaras || '')})<br>${esc(P.jawatanPenyelaras || 'Penyelaras Program')}</td>
        <td>Diluluskan / Tidak diluluskan:<br><br><br><br>.............................<br>(${esc(S.pengetua || '')})<br>${esc(S.jawatanPengetua || 'Pengetua')}</td></tr></table>
    </div>`; } },

  suratLantikan: { tajuk: 'Surat Lantikan AJK', perItem: 'ajk', gen(S, P) {
    const ajk = rows(P.ajk).filter(r => String(r[1] || '').trim());
    if (!ajk.length) return '<div class="page">Tiada AJK bernama. Sila isi tab Jawatankuasa.</div>';
    return ajk.map((r, i) => `<div class="page">${letterhead(S)}${refBlock(S, P, i + 1)}
      <p><b>${esc(r[1])}</b><br>${esc(S.nama || '')}</p>
      <p>Tuan/Puan,</p>
      <p><b>PELANTIKAN SEBAGAI ${esc((r[0] || '').toUpperCase())}<br>${esc((P.nama || '').toUpperCase())}</b></p>
      <p>Dengan segala hormatnya perkara di atas adalah dirujuk.</p>
      <p>2. Sukacita dimaklumkan bahawa tuan/puan telah dilantik sebagai <b>${esc(r[0])}</b> bagi ${esc(P.nama)} yang akan diadakan seperti berikut:</p>
      <div style="margin-left:30px">${progInfo(P)}</div>
      ${r[2] ? `<p>3. Bidang tugas tuan/puan adalah seperti berikut:</p><div style="margin-left:30px">${nl(r[2])}</div><p>4.` : '<p>3.'}
      Pihak sekolah amat menghargai komitmen dan kerjasama tuan/puan bagi menjayakan program ini.</p>
      <p>Sekian, terima kasih.</p>${signBlock(S)}</div>`).join('');
  } },

  suratJemputan: { tajuk: 'Surat Jemputan', perItem: 'tetamu', gen(S, P) {
    const t = rows(P.tetamu);
    if (!t.length) return '<div class="page">Tiada tetamu. Sila isi tab Tetamu.</div>';
    return t.map((r, i) => `<div class="page">${letterhead(S)}${refBlock(S, P, 'J' + (i + 1))}
      <p><b>${esc(r[0])}</b><br>${esc(r[1])}<br>${nl(r[2])}</p>
      <p>Tuan/Puan,</p>
      <p><b>JEMPUTAN KE ${esc((P.nama || '').toUpperCase())}</b></p>
      <p>Dengan segala hormatnya perkara di atas adalah dirujuk.</p>
      <p>2. Sukacita dimaklumkan bahawa ${esc(S.nama || 'pihak sekolah')} akan mengadakan ${esc(P.nama)} seperti butiran berikut:</p>
      <div style="margin-left:30px">${progInfo(P)}</div>
      <p>3. Sehubungan dengan itu, pihak sekolah dengan besar hati menjemput ${r[3] ? esc(r[3]) : 'tuan/puan'} untuk hadir ${P.perasmi && r[0] === P.perasmi ? 'dan seterusnya menyempurnakan majlis tersebut' : 'memeriahkan majlis tersebut'}.</p>
      <p>4. Kehadiran dan kerjasama tuan/puan amatlah dihargai dan didahului dengan ucapan terima kasih.</p>
      <p>Sekian, terima kasih.</p>${signBlock(S)}</div>`).join('');
  } },

  bukuProgram: { tajuk: 'Buku Program', gen(S, P) {
    const pen = rows(P.penerima);
    return `<div class="page booklet">${S.logo ? `<img src="${S.logo}" style="height:110px;margin:0 auto" alt="">` : ''}
        <div class="big">${esc((P.nama || '').toUpperCase())}</div>
        <div>${tarikhMs(P.tarikh, true)}<br>${esc(P.masa)}<br>${esc(P.tempat)}</div>
        ${P.perasmi ? `<p style="margin-top:30px">Dengan kehadiran<br><b>${esc(P.perasmi)}</b></p>` : ''}
        <p style="margin-top:40px"><b>${esc(S.nama || '')}</b></p></div>
      <div class="page"><h1>ATUR CARA MAJLIS</h1>
        <table class="doc"><tr><th style="width:25%">Masa</th><th>Acara</th></tr>
        ${rows(P.aturcara).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
        ${P.kataAlu ? `<h1 style="margin-top:30px">KATA ALUAN</h1><p>${nl(P.kataAlu)}</p>` : ''}</div>
      ${pen.length ? `<div class="page"><h1>SENARAI PENERIMA ANUGERAH</h1>
        <table class="doc"><tr><th>Bil</th><th>Nama</th><th>Kelas</th><th>Anugerah</th></tr>
        ${pen.map((r, i) => `<tr><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</table></div>` : ''}
      <div class="page"><h1>JAWATANKUASA PELAKSANA</h1>
        <table class="doc"><tr><th style="width:40%">Jawatan</th><th>Nama</th></tr>
        ${rows(P.ajk).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
        <p class="center" style="margin-top:30px"><i>Terima kasih atas kehadiran dan sokongan anda.</i></p></div>`;
  } },

  senaraiKehadiran: { tajuk: 'Senarai Kehadiran', gen(S, P) {
    const k = rows(P.kehadiran);
    const n = Math.max(k.length, 25);
    let body = '';
    for (let i = 0; i < n; i++) { const r = k[i] || [];
      body += `<tr style="height:26px"><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td></td></tr>`; }
    return `<div class="page">${letterhead(S)}<h1>SENARAI KEHADIRAN<br>${esc((P.nama || '').toUpperCase())}</h1>
      ${progInfo(P)}
      <table class="doc"><tr><th style="width:6%">Bil</th><th>Nama</th><th style="width:25%">Kelas / Jawatan</th><th style="width:22%">Tandatangan</th></tr>${body}</table></div>`;
  } },
  sebutHarga: { tajuk: 'Perbandingan Sebut Harga', gen(S, P) {
    const it = rows(P.sebutharga);
    const names = ['A', 'B', 'C'].map(x => P['pembekal' + x] || 'Pembekal ' + x);
    const tot = [0, 0, 0];
    const body = it.map((r, i) => {
      const q = num(r[1]);
      const cells = [0, 1, 2].map(k => { const t = q * num(r[2 + k]); tot[k] += t;
        return `<td style="text-align:right">${r[2 + k] ? rm(num(r[2 + k])) : '-'}</td><td style="text-align:right">${r[2 + k] ? rm(t) : '-'}</td>`; }).join('');
      return `<tr><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td class="center">${esc(r[1])}</td>${cells}</tr>`;
    }).join('');
    const valid = [0, 1, 2].filter(k => tot[k] > 0);
    const best = valid.length ? valid.reduce((a, b) => tot[b] < tot[a] ? b : a) : -1;
    return `<div class="page landscape">${letterhead(S)}
      <h1>JADUAL PERBANDINGAN SEBUT HARGA<br>${esc((P.nama || '').toUpperCase())}</h1>
      <table class="doc" style="font-size:9.5pt"><tr><th rowspan="2">Bil</th><th rowspan="2">Perkara</th><th rowspan="2">Kuantiti</th>
        ${names.map(n => `<th colspan="2">${esc(n)}</th>`).join('')}</tr>
        <tr>${names.map(() => '<th>Harga Seunit</th><th>Jumlah</th>').join('')}</tr>${body}
        <tr><th colspan="3" style="text-align:right">JUMLAH KESELURUHAN</th>${tot.map((t, k) => `<th colspan="2" style="text-align:right">${t ? rm(t) : '-'}</th>`).join('')}</tr></table>
      <h3>SYOR</h3>
      <p>${best >= 0 ? `Berdasarkan perbandingan di atas, adalah disyorkan supaya sebut harga daripada <b>${esc(names[best])}</b> dengan jumlah <b>${rm(tot[best])}</b> dipilih kerana menawarkan harga terendah dan memenuhi keperluan program.` : 'Sila lengkapkan harga daripada pembekal dalam tab Sebut Harga.'}</p>
      <table class="doc" style="margin-top:24px"><tr>
        <td style="width:33%;height:100px">Disediakan oleh:<br><br><br>.........................<br>(${esc(P.penyelaras || '')})<br>${esc(P.jawatanPenyelaras || 'Penyelaras Program')}</td>
        <td style="width:33%">Disemak oleh:<br><br><br>.........................<br>(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br>Setiausaha Kewangan</td>
        <td>Diluluskan / Tidak diluluskan:<br><br><br>.........................<br>(${esc(S.pengetua || '')})<br>${esc(S.jawatanPengetua || 'Pengetua')}</td></tr></table></div>`;
  } },

  laporanKewangan: { tajuk: 'Laporan Kewangan', gen(S, P) {
    const pr = rows(P.peruntukan), bl = rows(P.perbelanjaan);
    const tIn = pr.reduce((a, r) => a + num(r[1]), 0), tOut = bl.reduce((a, r) => a + num(r[4]), 0);
    const resit = P.resit || [];
    return `<div class="page">${letterhead(S)}
      <h1>LAPORAN KEWANGAN<br>${esc((P.nama || '').toUpperCase())}</h1>${progInfo(P)}
      <h3>A. PERUNTUKAN / PENDAPATAN</h3>
      <table class="doc"><tr><th style="width:8%">Bil</th><th>Sumber</th><th style="width:25%">Jumlah</th></tr>
      ${pr.map((r, i) => `<tr><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td style="text-align:right">${rm(num(r[1]))}</td></tr>`).join('')}
      <tr><th colspan="2" style="text-align:right">JUMLAH PERUNTUKAN (A)</th><th style="text-align:right">${rm(tIn)}</th></tr></table>
      <h3>B. PERBELANJAAN</h3>
      <table class="doc"><tr><th style="width:6%">Bil</th><th style="width:13%">Tarikh</th><th>Pembekal</th><th>No. Resit</th><th>Perkara</th><th style="width:16%">Jumlah</th></tr>
      ${bl.map((r, i) => `<tr><td class="center">${i + 1}</td><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td style="text-align:right">${rm(num(r[4]))}</td></tr>`).join('')}
      <tr><th colspan="5" style="text-align:right">JUMLAH PERBELANJAAN (B)</th><th style="text-align:right">${rm(tOut)}</th></tr></table>
      <h3>C. BAKI (A − B)</h3>
      <table class="doc" style="width:60%"><tr><th>Baki</th><td style="text-align:right;font-weight:bold">${rm(tIn - tOut)}</td></tr></table>
      ${tIn - tOut < 0 ? '<p><i>Nota: Perbelanjaan melebihi peruntukan.</i></p>' : ''}
      ${resit.length ? `<p>Lampiran: ${resit.length} salinan resit dilampirkan.</p>` : ''}
      <table class="doc" style="margin-top:24px"><tr>
        <td style="width:50%;height:100px">Disediakan oleh:<br><br><br>.........................<br>(${esc(P.penyelaras || '')})<br>${esc(P.jawatanPenyelaras || 'Penyelaras Program')}</td>
        <td>Disahkan oleh:<br><br><br>.........................<br>(${esc(S.pengetua || '')})<br>${esc(S.jawatanPengetua || 'Pengetua')}</td></tr></table></div>
      ${chunk(resit, 4).map((g, pi) => `<div class="page"><h1>LAMPIRAN RESIT ${resit.length > 4 ? '(' + (pi + 1) + ')' : ''}</h1>
        <div class="photo-grid">${g.map(x => `<figure><img src="${x.data}" alt=""><figcaption>${esc(x.cap)}</figcaption></figure>`).join('')}</div></div>`).join('')}`;
  } },

  laporanProgram: { tajuk: 'Laporan Program (OPR)', gen(S, P) {
    const g = (P.gambar || []).slice(0, 6);
    const row = (k, v) => `<tr><th style="width:24%;text-align:left">${k}</th><td>${v}</td></tr>`;
    return `<div class="page opr">${letterhead(S)}
      <h1>LAPORAN PROGRAM (ONE PAGE REPORT)</h1>
      <table class="doc" style="font-size:9.5pt">
        ${row('Nama Program', '<b>' + esc(P.nama) + '</b>')}
        ${row('Tarikh / Masa', tarikhMs(P.tarikh, true) + (P.masa ? ' · ' + esc(P.masa) : ''))}
        ${row('Tempat', esc(P.tempat))}
        ${row('Anjuran', esc(P.anjuran || S.nama))}
        ${row('Sasaran / Peserta', esc(P.sasaran) + (P.bilPeserta ? ' (' + esc(P.bilPeserta) + ' orang)' : ''))}
        ${row('Objektif', `<ol style="margin:0;padding-left:18px">${lines(P.objektif).map(o => `<li>${esc(o)}</li>`).join('')}</ol>`)}
        ${row('Ringkasan Aktiviti', nl(P.rumusan))}
        ${row('Pencapaian', nl(P.pencapaian))}
        ${row('Kekuatan', nl(P.kekuatan))}
        ${row('Kelemahan', nl(P.kelemahan))}
        ${row('Cadangan Penambahbaikan', nl(P.cadangan))}</table>
      ${g.length ? `<div class="photo-grid opr-photos">${g.map(x => `<figure><img src="${x.data}" alt=""><figcaption>${esc(x.cap)}</figcaption></figure>`).join('')}</div>` : ''}
      <table class="doc" style="margin-top:10px;font-size:9.5pt"><tr>
        <td style="width:50%;height:70px">Disediakan oleh:<br><br>.........................<br>(${esc(P.penyelaras || '')})</td>
        <td>Disahkan oleh:<br><br>.........................<br>(${esc(S.pengetua || '')})</td></tr></table></div>`;
  } },
};
const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };
