// models/platform.model.js
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const platformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  apiKey: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  secretKey: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  ipWhitelist: {
    type: [String],
    default: []
  },
  rateLimitPerMinute: {
    type: Number,
    default: 60
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: null
  }
});

// Método para verificar a API key
platformSchema.methods.verifyApiKey = function(apiKey) {
  return this.apiKey === apiKey;
};

// Middleware para excluir campos sensíveis na serialização
platformSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.secretKey;
    return ret;
  }
});

const Platform = mongoose.model('Platform', platformSchema);

export default Platform;