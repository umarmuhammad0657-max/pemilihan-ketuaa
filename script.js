// Nama kunci untuk localStorage
const candidateKey = 'pemilihan_candidates';
const votesKey = 'pemilihan_votes';
const votersKey = 'pemilihan_voters';

// Dapat dari storage atau inisialisasi baru
let candidates = JSON.parse(localStorage.getItem(candidateKey)) || [];
let votes = JSON.parse(localStorage.getItem(votesKey)) || {}; // { "Ali": 2, "Siti": 1 }
let voters = JSON.parse(localStorage.getItem(votersKey)) || {}; // { "Ahmad": "Ali" }

const formAdd = document.getElementById('formAddCandidate');
const candidateNameInput = document.getElementById('candidateName');
const candidateList = document.getElementById('candidateList');

const formVote = document.getElementById('formVote');
const voterNameInput = document.getElementById('voterName');
const candidateSelect = document.getElementById('candidateSelect');

const resultList = document.getElementById('resultList');
const resetBtn = document.getElementById('resetBtn');
const summary = document.getElementById('summary');

let chart = null;

// Simpan ke localStorage
function saveAll(){
  localStorage.setItem(candidateKey, JSON.stringify(candidates));
  localStorage.setItem(votesKey, JSON.stringify(votes));
  localStorage.setItem(votersKey, JSON.stringify(voters));
}

// Render senarai calon (di bahagian daftar)
function renderCandidates(){
  candidateList.innerHTML = '';
  candidates.forEach((name, idx) => {
    const li = document.createElement('li');
    li.textContent = name;

    const del = document.createElement('button');
    del.textContent = 'Buang';
    del.className = 'btn-delete';
    del.addEventListener('click', () => {
      if(!confirm(`Buang calon "${name}"? Undi calon ini akan hilang.`)) return;
      // Buang
      candidates.splice(idx, 1);
      delete votes[name];
      saveAll();
      renderAll();
    });

    li.appendChild(del);
    candidateList.appendChild(li);
  });
}

// Update pilihan dalam form undi
function renderVoteOptions(){
  candidateSelect.innerHTML = '';
  if(candidates.length === 0){
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Tiada calon - sila daftar dulu';
    candidateSelect.appendChild(opt);
    candidateSelect.disabled = true;
    formVote.querySelector('button').disabled = true;
  } else {
    candidateSelect.disabled = false;
    formVote.querySelector('button').disabled = false;
    const pl = document.createElement('option');
    pl.value = '';
    pl.textContent = 'Pilih calon';
    pl.disabled = true;
    pl.selected = true;
    candidateSelect.appendChild(pl);
    candidates.forEach(name => {
      const o = document.createElement('option');
      o.value = name; o.textContent = name;
      candidateSelect.appendChild(o);
    });
  }
}

// Tunjuk keputusan dalam teks
function renderResultsText(){
  resultList.innerHTML = '';
  candidates.forEach(name => {
    const li = document.createElement('li');
    li.textContent = `${name}: ${votes[name] || 0} undi`;
    resultList.appendChild(li);
  });
  const total = Object.keys(voters).length;
  summary.textContent = `Jumlah pengundi: ${total}`;
}

// Warna dinamik untuk grafik
function generateColors(n){
  const arr = [];
  for(let i=0;i<n;i++){
    const hue = Math.round((i*360)/Math.max(1,n));
    arr.push(`hsl(${hue} 75% 55% / 0.9)`);
  }
  return arr;
}

// Update atau buat Chart.js
function updateChart(){
  const labels = candidates;
  const data = candidates.map(n => votes[n] || 0);

  if(!chart){
    const ctx = document.getElementById('resultChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Jumlah Undi',
          data,
          backgroundColor: generateColors(labels.length),
          borderRadius:6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { precision:0 } }
        },
        plugins: { legend: { display:false } }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = generateColors(labels.length);
    chart.update();
  }
}

// Jalankan semua render
function renderAll(){
  renderCandidates();
  renderVoteOptions();
  renderResultsText();
  updateChart();
}

// Tambah calon
formAdd.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = candidateNameInput.value.trim();
  if(!name) return;
  if(candidates.includes(name)){
    alert('Calon sudah wujud!');
    candidateNameInput.value = '';
    return;
  }
  candidates.push(name);
  votes[name] = 0;
  saveAll();
  renderAll();
  candidateNameInput.value = '';
});

// Undi
formVote.addEventListener('submit', (e) => {
  e.preventDefault();
  const voter = voterNameInput.value.trim();
  const chosen = candidateSelect.value;

  if(!voter){ alert('Tulis nama pengundi!'); return; }
  if(!chosen){ alert('Pilih calon!'); return; }

  // Semak jika sudah mengundi (satu nama = satu undi)
  if(voters[voter]){
    alert(`${voter} sudah mengundi untuk ${voters[voter]}.`);
    return;
  }

  votes[chosen] = (votes[chosen] || 0) + 1;
  voters[voter] = chosen;
  saveAll();
  renderAll();
  voterNameInput.value = '';
  alert(`Terima kasih, ${voter}! Undian untuk ${chosen} direkod.`);
});

// Reset semua data (guna bila perlu)
resetBtn.addEventListener('click', () => {
  if(confirm('Padam semua data calon, undi dan pengundi? Ini tak boleh undur.')){
    localStorage.removeItem(candidateKey);
    localStorage.removeItem(votesKey);
    localStorage.removeItem(votersKey);
    // reload untuk bersihkan semua
    location.reload();
  }
});

// mula render bila buka page
renderAll();
