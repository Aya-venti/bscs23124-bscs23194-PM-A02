//src/pm_app.js
const API_BASE = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', async () => {
  await initDataPopulations();       
  loadBookmarks();
  const url = new URL(window.location.href);
  const topicKey = url.searchParams.get('topic');
  if (topicKey) {
    const sel = document.getElementById('topicSelect');
    setTimeout(() => {
      if (sel && [...sel.options].some(o => o.value === topicKey)) {
        sel.value = topicKey;
        showComparison();          
      }
    }, 300);
  }
});

//  Standards 
async function openStandard(standard, page = null) {
  const url = `/pm_viewer.html?standard=${standard}${page ? `&page=${page}` : ''}`;
  window.open(url, '_blank');
}

function downloadStandard(standard) {
  window.location.href = `/docs/${standard}.pdf`;
}

//  Topics & Scenarios
async function initDataPopulations() {
  try {
    const topicsRes = await fetch(`${API_BASE}/topics`);
    const data = await topicsRes.json();
    const topics = data.topics || data;

    const topicSelect = document.getElementById('topicSelect');
    if (topicSelect) {
      topicSelect.innerHTML = '<option value="">Select a topic...</option>';
      topics.forEach(topic => {
        const opt = document.createElement('option');
        opt.value = topic.key;        
        opt.textContent = topic.title || topic.key; 
        topicSelect.appendChild(opt);
      });
    }
    // Fetch scenarios 
    const scRes = await fetch(`${API_BASE}/scenarios`);
    const scenarios = await scRes.json();
    
    console.log('Scenarios loaded:', scenarios);

    const scenarioSelect = document.getElementById('projectTypeSelect');
    if (scenarioSelect) {
      scenarioSelect.innerHTML = '<option value="">Select project type...</option>';
      
      scenarios.forEach(scenario => {
        const opt = document.createElement('option');
        opt.value = scenario.name || scenario._id;
        opt.textContent = scenario.name || scenario.title || 'Unnamed Scenario';
        scenarioSelect.appendChild(opt);
      });
      
      console.log('Scenario dropdown populated with:', scenarios.length, 'options');
    }

  } catch (err) {
    console.error('❌ Failed to init data', err);
  }
}

async function showComparison() {
    const sel = document.getElementById('topicSelect');
    if (!sel) return;
    const topicKey = sel.value;
    if (!topicKey) return;

    try {
        const res = await fetch(`${API_BASE}/topics/${topicKey}`);
        const t = await res.json();
        const out = document.getElementById('comparisonResults');
        if (!out) return;

        out.style.display = 'block';
        out.innerHTML = `
            <h3>${t.title || topicKey}</h3>

            <div class="comparison-tabs">
                <div class="tab active" data-tab="similarities">Similarities</div>
                <div class="tab" data-tab="differences">Differences</div>
                <div class="tab" data-tab="unique">Unique Points</div>
            </div>

            <!-- Similarities -->
            <div class="tab-content active" id="similaritiesTab">
                <ul>
                   ${(t.similarities || '')
                    .split(/\n+/)
                    .map(s => s.trim())
                    .filter(Boolean)
                    .map(s => `<li>${s.replace(/^•?\s*/, '')}</li>`)
                    .join('')}
                </ul>
            </div>

            <!-- Differences -->
            <div class="tab-content" id="differencesTab">
                <div class="comparison-grid">
                    <div class="standard-comparison">
                        <h4>PMBOK</h4>
                        <p>${t.differences?.["PMBOK"] || ''}</p>
                         ${Array.isArray(t.deepLinks?.PMBOK)
                           ? t.deepLinks.PMBOK.map(p => 
                            `<a href="/docs/PMBOK7.pdf#page=${p}" target="_blank" class="deep-link">🔗 PMBOK p.${p}</a>`
                           ).join('<br>')
                           : (t.deepLinks?.PMBOK 
                            ? `<a href="/docs/PMBOK7.pdf#page=${t.deepLinks.PMBOK}" target="_blank" class="deep-link">🔗 PMBOK p.${t.deepLinks.PMBOK}</a>` 
                            : '')}

                    </div>
                    <div class="standard-comparison">
                        <h4>PRINCE2</h4>
                        <p>${t.differences?.PRINCE2 || ''}</p>
                        ${Array.isArray(t.deepLinks?.PRINCE2)
                          ? t.deepLinks.PRINCE2.map(p => 
                          `<a href="/docs/PRINCE2.pdf#page=${p}" target="_blank" class="deep-link">🔗 PRINCE2 p.${p}</a>`
                          ).join('<br>')
                         : (t.deepLinks?.PRINCE2 
                          ? `<a href="/docs/PRINCE2.pdf#page=${t.deepLinks.PRINCE2}" target="_blank" class="deep-link">🔗 PRINCE2 p.${t.deepLinks.PRINCE2}</a>` 
                         : '')}
                        
                    </div>
                    <div class="standard-comparison">
                        <h4>ISO 21502</h4>
                        <p>${t.differences?.["ISO21502"] || ''}</p>
                        ${Array.isArray(t.deepLinks?.ISO21502)
                           ? t.deepLinks.ISO21502.map(p => 
                           `<a href="/docs/ISO21502.pdf#page=${p}" target="_blank" class="deep-link">🔗 ISO21502 p.${p}</a>`
                           ).join('<br>')
                           : (t.deepLinks?.ISO21502 
                           ? `<a href="/docs/ISO21502.pdf#page=${t.deepLinks.ISO21502}" target="_blank" class="deep-link">🔗 ISO21502 p.${t.deepLinks.ISO21502}</a>` 
                          : '')}
                    </div>
                </div>
            </div>

            <!-- Unique Points -->
            <div class="tab-content" id="uniqueTab">
                <div class="comparison-grid">
                    <div class="standard-comparison">
                        <h4>PMBOK</h4>
                        <p>${t.uniquePoints?.["PMBOK"] || ''}</p>
                          ${Array.isArray(t.deepLinks?.PMBOK)
                           ? t.deepLinks.PMBOK.map(p => 
                            `<a href="/docs/PMBOK7.pdf#page=${p}" target="_blank" class="deep-link">🔗 PMBOK p.${p}</a>`
                           ).join('<br>')
                           : (t.deepLinks?.PMBOK 
                            ? `<a href="/docs/PMBOK7.pdf#page=${t.deepLinks.PMBOK}" target="_blank" class="deep-link">🔗 PMBOK p.${t.deepLinks.PMBOK}</a>` 
                            : '')}
                    </div>
                    <div class="standard-comparison">
                        <h4>PRINCE2</h4>
                        <p>${t.uniquePoints?.PRINCE2 || ''}</p>
                         ${Array.isArray(t.deepLinks?.PRINCE2)
                          ? t.deepLinks.PRINCE2.map(p => 
                          `<a href="/docs/PRINCE2.pdf#page=${p}" target="_blank" class="deep-link">🔗 PRINCE2 p.${p}</a>`
                          ).join('<br>')
                         : (t.deepLinks?.PRINCE2 
                          ? `<a href="/docs/PRINCE2.pdf#page=${t.deepLinks.PRINCE2}" target="_blank" class="deep-link">🔗 PRINCE2 p.${t.deepLinks.PRINCE2}</a>` 
                         : '')}
                        
                    </div>
                    </div>
                    <div class="standard-comparison">
                        <h4>ISO 21502</h4>
                        <p>${t.uniquePoints?.["ISO21502"] || ''}</p>
                        ${Array.isArray(t.deepLinks?.ISO21502)
                           ? t.deepLinks.ISO21502.map(p => 
                           `<a href="/docs/ISO21502.pdf#page=${p}" target="_blank" class="deep-link">🔗 ISO21502 p.${p}</a>`
                           ).join('<br>')
                           : (t.deepLinks?.ISO21502 
                           ? `<a href="/docs/ISO21502.pdf#page=${t.deepLinks.ISO21502}" target="_blank" class="deep-link">🔗 ISO21502 p.${t.deepLinks.ISO21502}</a>` 
                          : '')}
                    </div>
                </div>
            </div>

            <button class="action-btn" onclick="bookmarkComparisonTopic('${topicKey}')">
              <i class="fas fa-bookmark"></i> Bookmark
            </button>
        `;
        //tab swithcing exist here 
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(`${tabId}Tab`).classList.add('active');
            });
        });

    } catch (err) {
        console.error(err);
        alert('❌ Failed to load topic');
    }
}

//  Search BAR Function 
function filterTopics() {
  const searchInput = document.getElementById("searchInput");
  const filter = searchInput.value.toLowerCase();
  const topicSelect = document.getElementById("topicSelect");
  if (!topicSelect || topicSelect.options.length <= 1) return;
  for (let i = 0; i < topicSelect.options.length; i++) {
    const option = topicSelect.options[i];
    const text = option.text.toLowerCase();
    if (i === 0) {
      option.style.display = "";
      continue;
    }
    option.style.display = text.includes(filter) ? "" : "none";
  }

  const visibleOptions = Array.from(topicSelect.options)
    .filter(o => o.style.display !== "none").length;

  const resultsDiv = document.getElementById("comparisonResults");

  if (visibleOptions <= 1) {
    resultsDiv.innerHTML = "<p style='color:#777;font-style:italic;'>No topics found for your search.</p>";
    resultsDiv.style.display = "block";
  } else {
    resultsDiv.style.display = "none";
  }
  if (visibleOptions === 2) {
    const onlyMatch = Array.from(topicSelect.options).find(
      (o, idx) => idx > 0 && o.style.display !== "none"
    );
    if (onlyMatch) {
      topicSelect.value = onlyMatch.value;
      showComparison();
    }
  }
}

async function showTailoredProcess() {
  const sel = document.getElementById('projectTypeSelect');
  if (!sel) return;
  const scenarioName = sel.value;
  
  console.log('Selected scenario:', scenarioName);
  
  if (!scenarioName) {
    alert('Please select a project scenario first');
    return;
  }

  const out = document.getElementById('processOutput');
  if (!out) return;

  out.innerHTML = '<div class="loading">Loading process data...</div>';

  try {
    console.log('Fetching from:', `/api/processes/${encodeURIComponent(scenarioName)}`);
    
    const res = await fetch(`/api/processes/${encodeURIComponent(scenarioName)}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const process = await res.json();
    
    if (process.error) {
      throw new Error(process.error);
    }
    
    console.log('Process data received:', process);
    out.innerHTML = generateProcessHTML(process);
    
  } catch (err) {
    console.error('Error fetching process:', err);
    out.innerHTML = `
      <div class="error-message">
        <h3>❌ Error Loading Process</h3>
        <p>${err.message}</p>
        <button onclick="showTailoredProcess()">Try Again</button>
      </div>
    `;
  }
}

function generateProcessHTML(process) {
  return `
    <div class="process-header">
      <h2>${process.title}</h2>
      <div class="context-box">
        <strong>Context:</strong> ${process.context}
      </div>
      <div class="objective-box">
        <strong>Objective:</strong> ${process.objective}
      </div>
    </div>
    
    <div class="standards-reference">
      <h3>Referenced Standards</h3>
      <div class="standards-grid">
        <div class="standard-item">
          <h4>PMBOK 7</h4>
          <p>${process.referencedStandards.PMBOK}</p>
        </div>
        <div class="standard-item">
          <h4>PRINCE2</h4>
          <p>${process.referencedStandards.PRINCE2}</p>
        </div>
        <div class="standard-item">
          <h4>ISO 21502</h4>
          <p>${process.referencedStandards.ISO}</p>
        </div>
      </div>
    </div>
    
    <div class="process-diagram">
      <h3>Process Workflow</h3>
       <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
         <p><em>Process diagram for ${process.title}</em></p>
         <img 
            src="/docs/${process.type}_process_flow.png" 
            alt="Process diagram for ${process.title}" 
            style="max-width: 30%; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-top: 10px;"
            onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<p style=\'color:red;\'>⚠️ Diagram image not found.</p>')"
          />
       </div>
    </div>


    
    <div class="phases-breakdown">
      <h3>Detailed Process Breakdown</h3>
      ${process.phases.map((phase, index) => `
        <div class="phase-card">
          <h4>Phase ${index + 1}: ${phase.name}</h4>
          <div class="phase-details">
            <div class="detail-section">
              <strong>Key Activities:</strong>
              <ul>${phase.activities.map(activity => `<li>${activity}</li>`).join('')}</ul>
            </div>
            <div class="detail-section">
              <strong>Deliverables:</strong>
              <ul>${phase.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}</ul>
            </div>
            <div class="detail-section">
              <strong>Roles:</strong>
              <ul>${phase.roles.map(role => `<li>${role}</li>`).join('')}</ul>
            </div>
            <div class="detail-section">
              <strong>Decision Gates:</strong>
              <ul>${phase.decisionGates.map(gate => `<li>${gate}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="tailoring-justification">
      <h3>Tailoring Justification</h3>
      <p>${process.tailoringJustification}</p>
    </div>
  `;
}

// Bookmark

async function bookmarkStandard(standard, page = null, topicKey = null, note = '') {
  try {
    
    if (standard && page === null) {
      let currentPage = 1;
      const pdfFrame = document.querySelector('iframe, embed');
      if (pdfFrame && pdfFrame.src.includes('#page=')) {
        const match = pdfFrame.src.match(/#page=(\d+)/);
        if (match) currentPage = parseInt(match[1]);
      } else {
       
        const hash = window.location.hash.match(/page=(\d+)/);
        if (hash) currentPage = parseInt(hash[1]);
      }
      page = currentPage;
    }

    const payload = { standard, page, topicKey, note };
    if (!topicKey && !standard) {
      alert('Please provide a topic or standard to bookmark.');
      return;
    }

    const res = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(await res.text());
    alert('✅ Bookmark saved');
    loadBookmarks();
  } catch (err) {
    console.error('bookmarkStandard error', err);
    alert('❌ ' + err.message);
  }
}
async function loadBookmarks() {
  const out = document.getElementById('bookmarksList');
  if (!out) return;

  try {
    const res = await fetch(`${API_BASE}/bookmarks`);
    if (!res.ok) throw new Error(await res.text());
    const bookmarks = await res.json();

    if (!bookmarks || !bookmarks.length) {
      out.innerHTML = '<p>No bookmarks saved yet.</p>';
      return;
    }
    const topicBookmarks = bookmarks.filter(b => b.topicKey);
    const standardBookmarks = bookmarks.filter(b => b.standard);
    const renderStandardItems = standardBookmarks.map(b => `
      <li class="bm-item" data-id="${b._id}">
        <i class="fas fa-file-pdf"></i>
        <strong style="margin-left:8px;">${b.standard}</strong>
         — <a href="/docs/${b.standard}.pdf#page=${b.page}" target="_blank">Page ${b.page}</a>
        <br/><small>${new Date(b.createdAt).toLocaleString()}</small>
        <div class="bm-actions" style="margin-top:6px;">
          <button onclick="editBookmark('${b._id}')" class="bm-edit">Edit</button>
          <button onclick="deleteBookmark('${b._id}')" class="bm-delete">Delete</button>
        </div>
      </li>
    `).join('');

    const renderTopicItems = topicBookmarks.map(b => `
      <li class="bm-item" data-id="${b._id}">
        <i class="fas fa-lightbulb"></i>
        <strong style="margin-left:8px; cursor:pointer;" onclick="selectTopicFromBookmark('${b.topicKey}')">${b.topicKey}</strong>
        ${b.note ? ` — ${b.note}` : ''}
        <br/><small>${new Date(b.createdAt).toLocaleString()}</small>
        <div class="bm-actions" style="margin-top:6px;">
          <button onclick="editBookmark('${b._id}')" class="bm-edit">Edit</button>
          <button onclick="deleteBookmark('${b._id}')" class="bm-delete">Delete</button>
        </div>
      </li>
    `).join('');

    out.innerHTML = `
      <div class="bookmark-category">
        <h3>📘 Standard Bookmarks</h3>
        ${standardBookmarks.length ? `<ul class="bookmark-list">${renderStandardItems}</ul>` : '<p>No standard bookmarks yet.</p>'}
      </div>

      <div class="bookmark-category">
        <h3>Comparison Bookmarks</h3>
        ${topicBookmarks.length ? `<ul class="bookmark-list">${renderTopicItems}</ul>` : '<p>No topic bookmarks yet.</p>'}
      </div>
    `;

  } catch (err) {
    console.error('Failed to load bookmarks', err);
    out.innerHTML = '<p style="color:red;">Error loading bookmarks.</p>';
  }
}
async function deleteBookmark(id) {
  if (!confirm('Delete this bookmark?')) return;
  try {
    const res = await fetch(`${API_BASE}/bookmarks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    alert('Bookmark deleted');
    loadBookmarks();
  } catch (err) {
    console.error('deleteBookmark error', err);
    alert('Failed to delete bookmark');
  }
}

async function editBookmark(id) {
  try {
   
    const res0 = await fetch(`${API_BASE}/bookmarks`);
    const all = await res0.json();
    const bm = all.find(x => x._id === id);
    if (!bm) { alert('Bookmark not found'); return; }

    const newNote = prompt('Edit note (leave empty to remove):', bm.note || '');
    let newPage = bm.page || 1;
    if (bm.standard) {
      const pageInput = prompt('Edit page number:', String(bm.page || 1));
      if (pageInput !== null) newPage = Number(pageInput) || 1;
    }

    const payload = {};
    if (newNote !== null) payload.note = newNote;
    if (bm.standard && newPage) payload.page = newPage;

    const res = await fetch(`${API_BASE}/bookmarks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    alert('Bookmark updated');
    loadBookmarks();
  } catch (err) {
    console.error('editBookmark error', err);
    alert('Failed to update bookmark');
  }
}

async function selectTopicFromBookmark(topicKey) {
  const sel = document.getElementById('topicSelect');
  if (sel) {
    sel.value = topicKey;
    showComparison();
    
    if (!document.getElementById('comparisonResults')) {
      window.location.href = 'pm_comparison.html?topic=' + encodeURIComponent(topicKey);
    }
  } else {
    
    window.location.href = 'pm_comparison.html?topic=' + encodeURIComponent(topicKey);
  }
}
async function bookmarkComparisonTopic(topicKey) {
  const bookmark = {
    type: "comparison",
    topicKey,
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookmark)
    });

    if (!res.ok) throw new Error(await res.text());
    alert(` Bookmark saved for Similarities of "${topicKey}"`);
  } catch (err) {
    console.error(err);
    alert('❌ Failed to save bookmark');
  }
}
