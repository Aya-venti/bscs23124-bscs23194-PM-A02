// models/Topic.js
const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "risk_management" or "team_leadership"
  title: String,
  PMBOK: mongoose.Schema.Types.Mixed,
  PMBOK_link: String,
  PRINCE2: mongoose.Schema.Types.Mixed,
  PRINCE2_link: String,
  ISO21502: mongoose.Schema.Types.Mixed,
  ISO_link: String,
  similarities: { type: String, default: "" },
  differences: { type: mongoose.Schema.Types.Mixed, default: {} }, // can store text or object
  uniquePoints: { type: mongoose.Schema.Types.Mixed, default: {} }, // allows text or object
  deepLinks: {                 // NEW FIELD
    PMBOK: { type: [Number], default: [] },
    PRINCE2: { type: [Number], default: [] },
    ISO21502: { type: [Number], default: [] }
}
},
{ timestamps: true });

module.exports = mongoose.model('Topic', TopicSchema);
