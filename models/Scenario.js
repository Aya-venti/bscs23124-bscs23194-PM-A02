// models/Scenario.js - UPDATED
const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  type: { type: String, required: false },
  name: { type: String, required: true, unique: true },
  summary: String,
  context: String,
  objective: String,
  referencedStandards: {
    PMBOK: String,
    PRINCE2: String,
    ISO: String
  },
  phases: [{
    name: String,
    activities: [String],
    deliverables: [String],
    roles: [String],
    decisionGates: [String]
  }],
  tailoringJustification: String,
  steps: [String],
  mapping: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Scenario', ScenarioSchema);