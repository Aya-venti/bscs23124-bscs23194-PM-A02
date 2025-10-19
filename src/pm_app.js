
// Main application functionality
const API_BASE = window.location.origin + '/api';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Launch Agency Standards Repository loaded');
  initDataPopulations();
  loadBookmarks();
});

// ========== Standards Actions ==========
async function openStandard(standard, page = null) {
  if (page) {
    window.open(`/docs/${standard}.pdf#page=${page}`, '_blank');
  } else {
    window.open(`/docs/${standard}.pdf`, '_blank');
  }
}

function downloadStandard(standard) {
  window.location.href = `/docs/${standard}.pdf`;
}

async function bookmarkStandard(standard, page = 1, topicKey = null, note = '') {
  try {
    const payload = { standard, page, topicKey, note };
    const res = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    alert('✅ Bookmark saved');
    console.log(json);
    loadBookmarks();
  } catch (err) {
    console.error(err);
    alert('❌ Failed to save bookmark');
  }
}

// ========== Populate Topics & Scenarios ==========
async function initDataPopulations() {
  try {
    // Fetch topics
    const topicsRes = await fetch(`${API_BASE}/topics`);
    const data = await topicsRes.json();

    // Some APIs return {topics: [...]}, some just return [...]
    const topics = data.topics || data;

    const topicSelect = document.getElementById('topicSelect');
    if (topicSelect) {
      topicSelect.innerHTML = '<option value="">Select a topic...</option>';
      topics.forEach(topic => {
        const opt = document.createElement('option');
        opt.value = topic.key;        // must match backend field
        opt.textContent = topic.title || topic.key; 
        topicSelect.appendChild(opt);
      });
    }

    // Fetch scenarios (for process generator page)
    const scRes = await fetch(`${API_BASE}/scenarios`);
    const scenarios = await scRes.json();
    
    console.log('Scenarios loaded:', scenarios);

    const scenarioSelect = document.getElementById('projectTypeSelect');
    if (scenarioSelect) {
      scenarioSelect.innerHTML = '<option value="">Select project type...</option>';
      
      scenarios.forEach(scenario => {
        const opt = document.createElement('option');
        // Use the name field that matches exactly what's in database
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

//========== Show Comparison ==========
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

            <button class="action-btn" onclick="bookmarkStandard(null, 1, '${topicKey}')">
                🔖 Bookmark this topic
            </button>
        `;

        // Enable tab switching
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



// ========== Show Tailored Process ==========
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
// Generate HTML for process display (same as before)
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
      <h3>📚 Referenced Standards</h3>
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
      <h3>🔄 Process Workflow</h3>
       <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
         <p><em>Process diagram for ${process.title}</em></p>
         <img 
            src="/docs/${process.type}_process_flow.png" 
            alt="Process diagram for ${process.title}" 
            style="max-width: 60%; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-top: 10px;"
            onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<p style=\'color:red;\'>⚠️ Diagram image not found.</p>')"
          />
       </div>
    </div>


    
    <div class="phases-breakdown">
      <h3>📋 Detailed Process Breakdown</h3>
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
// ========== Load Bookmarks ==========
async function loadBookmarks() {
  const out = document.getElementById('bookmarks');
  if (!out) return;
  try {
    const res = await fetch(`${API_BASE}/bookmarks`);
    const data = await res.json();
    out.innerHTML = '<ul>' + data.map(b =>
      `<li>${b.topicKey || b.standard} (page ${b.page}) — ${new Date(b.createdAt).toLocaleString()}</li>`
    ).join('') + '</ul>';
  } catch (err) {
    console.error(err);
  }
}