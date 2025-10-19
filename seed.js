// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Topic = require('./models/Topic');
const Scenario = require('./models/Scenario');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/pm_standards';

async function main() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to Mongo');

  const file = path.join(__dirname, 'data', 'pm_data.json');
  if (!fs.existsSync(file)) {
    console.error('data/pm_data.json not found');
    process.exit(1);
  }

  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);

  // Topics: pm_data.json uses `topics` keyed object
  const topicsObj = data.topics || {};
  const topicKeys = Object.keys(topicsObj);
  console.log(`Seeding ${topicKeys.length} topics...`);
  
  for (const key of topicKeys) {
    const t = topicsObj[key];
    const doc = {
      key,
      title: t.title || key,
      PMBOK: t.PMBOK || t.PMBOK || '',
      PMBOK_link: t.PMBOK_link || '',
      PRINCE2: t.PRINCE2 || '',
      PRINCE2_link: t.PRINCE2_link || '',
      ISO21502: t.ISO21502 || '',
      ISO_link: t.ISO_link || '',
      similarities: t.similarities || '',
      differences: t.differences || '',
      uniquePoints: t.unique || t.uniquePoints || '',
      deepLinks :{
        PMBOK: (t.deepLinks && t.deepLinks.PMBOK) 
             ?? (t.PMBOK_link ? Number(t.PMBOK_link) : null),
        PRINCE2: (t.deepLinks && t.deepLinks.PRINCE2) 
             ?? (t.PRINCE2_link ? Number(t.PRINCE2_link) : null),
        ISO21502: (t.deepLinks && t.deepLinks.ISO21502) 
             ?? (t.ISO_link ? Number(t.ISO_link) : null)
        }

    };
    await Topic.findOneAndUpdate({ key }, doc, { upsert: true });
  }

  // Scenarios
  
 // FIXED: Scenarios seeding - properly read from pm_data.json
  console.log('Seeding scenarios...');
  const scenariosObj = data.scenarios || {};
  const scenarioKeys = Object.keys(scenariosObj);
  
  for (const key of scenarioKeys) {
    const scenario = scenariosObj[key];
    console.log(`Seeding scenario: ${scenario.name}`);
    
    await Scenario.findOneAndUpdate(
      { name: scenario.name },
      scenario,
      { upsert: true }
    );
  }

  console.log('Seeding complete.');
  mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
