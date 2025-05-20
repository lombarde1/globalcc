// models/creditCard.model.js
import mongoose from 'mongoose';

const creditCardSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  expirationDate: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true
  },
  holderName: {
    type: String,
    required: true
  },
  cpf: {
    type: String,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: String,
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  platform: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para melhorar a performance
creditCardSchema.index({ number: 1 });
creditCardSchema.index({ isUsed: 1 });

const CreditCard = mongoose.model('CreditCard', creditCardSchema);

export default CreditCard;