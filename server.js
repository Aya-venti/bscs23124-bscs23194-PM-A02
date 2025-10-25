// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const Topic = require('./models/Topic');
const Scenario = require('./models/Scenario');
const Bookmark = require('./models/Bookmark');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'src')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Connect to MongoDB
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/pm_standards';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

//load fallback JSON
function loadLocalData() {
  const file = path.join(__dirname, 'data', 'pm_data.json');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}
 /* ROUTES*/ 
app.get('/api/topics', async (req, res) => {
  try {
    const count = await Topic.countDocuments();
    if (count === 0) {
      const data = loadLocalData();
      if (!data) return res.json({ topics: [] });
      const topicsObj = data.topics || data;
      const arr = Object.keys(topicsObj).map(k => ({ key: k, ...(topicsObj[k] || {}) }));
      return res.json({ topics: arr });
    } else {
      const topics = await Topic.find().sort({ key: 1 });
      return res.json({ topics });
    }
  } catch (err) {
    console.error('Error in GET /api/topics', err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/topics/:key', async (req, res) => {
  const key = req.params.key;
  try {
    const topic = await Topic.findOne({ key });
    if (topic) return res.json(topic);

    // fallback to local json
    const data = loadLocalData();
    if (data && data.topics && data.topics[key]) {
      const t = { key, ...(data.topics[key] || {}) };
      return res.json(t);
    }
    return res.status(404).json({ error: 'Topic not found' });
  } catch (err) {
    console.error('Error in GET /api/topics/:key', err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/processes/:scenarioName', async (req, res) => {
  try {
    const { scenarioName } = req.params;
    const decodedName = decodeURIComponent(scenarioName).trim().toLowerCase();
    console.log(`🔍 Requested scenario: "${decodedName}"`);
    const scenario = await Scenario.findOne({
      $or: [
        { type: new RegExp(`^${decodedName}$`, 'i') },
        { name: new RegExp(`^${decodedName}$`, 'i') },
        { title: new RegExp(`^${decodedName}$`, 'i') }
      ]
    });
    if (!scenario) {
      const all = await Scenario.find({}, 'type name');
      const available = all.map(s => s.type || s.name);
      console.warn('⚠️ Scenario not found. Available:', available);
      return res.status(404).json({
        error: `Scenario "${decodedName}" not found.`,
        available
      });
    }

    const result = {
      type: scenario.type || scenario.name,
      title: scenario.name,
      context: scenario.context,
      objective: scenario.objective,
      referencedStandards: scenario.referencedStandards,
      phases: scenario.phases,
      tailoringJustification: scenario.tailoringJustification
    };

    console.log(`✅ Found scenario: ${result.title}`);
    res.json(result);

  } catch (err) {
    console.error('❌ Error fetching process:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('/api/bookmarks', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().sort({ createdAt: -1 }).limit(200);
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'pm_index.html'));
});
app.post('/api/bookmarks', async (req, res) => {
  try {
    const { topicKey, standard, page, note } = req.body;
    // it avoids empty save
    if (!topicKey && !standard) {
      return res.status(400).json({ error: 'Bookmark must have either a topicKey or a standard.' });
    }
    const bookmark = new Bookmark({
      topicKey: topicKey || null,
      standard: standard || null,
      page: page || 1,
      note: note || ''
    });

    await bookmark.save();
    console.log('✅ Bookmark saved:', bookmark);
    res.status(201).json(bookmark);
  } catch (err) {
    console.error('❌ Error saving bookmark:', err);
    res.status(500).json({ error: 'Server error while saving bookmark.' });
  }
});
app.delete('/api/bookmarks/:id', async (req, res) => {
  await Bookmark.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.patch('/api/bookmarks/:id', async (req, res) => {
  try {
    const updates = (({ note, page, standard, topicKey }) => ({ note, page, standard, topicKey }))(req.body);
    
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
    const bm = await Bookmark.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!bm) return res.status(404).json({ error: 'Bookmark not found' });
    res.json(bm);
  } catch (err) {
    console.error('Error in PATCH /api/bookmarks/:id', err);
    res.status(500).json({ error: 'server error' });
  }
});

