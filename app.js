const API='https://script.google.com/macros/s/AKfycbwEu48llXaE4KJMl_8GoehxE1OEk4LRClgNS-t-ffY4atCSObg77vKXRB9CvE0XIgDV/exec';

let DATA=[];

function rupiah(v){return 'Rp'+Number(v).toLocaleString('id-ID');}

function render(rows){
 const tb=document.getElementById('tableData');
 tb.innerHTML='';
 rows.forEach(r=>{
  tb.innerHTML+=`<tr>
  <td>${r['Produk']}</td>
  <td>${r['Varian']}</td>
  <td>${rupiah(r['Harga Reseller'])}</td>
  <td>${rupiah(r['Harga Umum'])}</td>
  <td class="${r['Status']=='Ready'?'ready':'off'}">${r['Status']=='Ready'?'🟢 Ready':'🔴 Tidak Ready'}</td>
  </tr>`;
 });
}

fetch(API).then(r=>r.json()).then(d=>{DATA=d;render(d);});

document.getElementById('search').addEventListener('input',e=>{
 const q=e.target.value.toLowerCase();
 render(DATA.filter(x=>(x['Produk']||'').toLowerCase().includes(q)));
});
