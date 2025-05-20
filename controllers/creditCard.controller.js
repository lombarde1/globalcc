// controllers/creditCard.controller.js
import axios from 'axios';
import CreditCard from '../models/creditCard.model.js';

// Função auxiliar para validar cartão de crédito usando algoritmo de Luhn
function isValidCreditCard(number) {
  let sum = 0;
  let isEven = false;
  
  // Loop através dos dígitos em ordem reversa
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Função auxiliar para gerar número de cartão válido
function generateValidCreditCardNumber() {
  const prefix = '4532'; // Começando com 4 (Visa)
  let number = prefix;
  
  // Gerar 11 dígitos aleatórios
  for (let i = 0; i < 11; i++) {
    number += Math.floor(Math.random() * 10);
  }
  
  // Calcular dígito verificador
  let sum = 0;
  let isEven = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return number + checkDigit;
}

// Função auxiliar para gerar CPF válido
function generateValidCPF() {
  const generateDigit = (digits) => {
    let sum = 0;
    let weight = digits.length + 1;
    
    for(let i = 0; i < digits.length; i++) {
      sum += digits[i] * weight;
      weight--;
    }
    
    const digit = 11 - (sum % 11);
    return digit > 9 ? 0 : digit;
  };
  
  const numbers = [];
  for(let i = 0; i < 9; i++) {
    numbers.push(Math.floor(Math.random() * 10));
  }
  
  const digit1 = generateDigit(numbers);
  numbers.push(digit1);
  const digit2 = generateDigit(numbers);
  numbers.push(digit2);
  
  return numbers.join('');
}

// @desc    Gerar novo cartão de crédito
// @route   POST /api/credit-cards/generate
// @access  Public
export const generateCreditCard = async (req, res) => {
  try {
    // Gerar dados usando a API Faker
    const fakerResponse = await axios.get('https://fakerapi.it/api/v1/persons?_quantity=1&_locale=ar_SA');
    const person = fakerResponse.data.data[0];
    
    // Gerar cartão de crédito válido
    const cardNumber = generateValidCreditCardNumber();
    
    // Gerar data de validade (entre 2 e 5 anos a partir de agora)
    const today = new Date();
    const years = Math.floor(Math.random() * 4) + 2;
    const month = Math.floor(Math.random() * 12) + 1;
    const expirationDate = `${month.toString().padStart(2, '0')}/${(today.getFullYear() + years).toString().slice(-2)}`;
    
    // Gerar CVV
    const cvv = Math.floor(Math.random() * 900) + 100;
    
    // Gerar CPF válido
    const cpf = generateValidCPF();

    // Criar novo cartão no banco de dados
    const creditCard = await CreditCard.create({
      number: cardNumber,
      expirationDate,
      cvv: cvv.toString(),
      holderName: person.firstname + ' ' + person.lastname,
      cpf,
      isUsed: false
    });

    // Registrar logs para auditoria
    console.log(`Cartão gerado: ${creditCard._id}`);

    res.status(201).json({
      success: true,
      message: 'Cartão de crédito gerado com sucesso',
      card: {
        number: creditCard.number,
        expirationDate: creditCard.expirationDate,
        cvv: creditCard.cvv,
        holderName: creditCard.holderName,
        cpf: creditCard.cpf
      }
    });
  } catch (error) {
    console.error(`Erro ao gerar cartão de crédito: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar cartão de crédito',
      error: error.message
    });
  }
};

// @desc    Validar cartão de crédito
// @route   POST /api/credit-cards/validate
// @access  Public
export const validateCreditCard = async (req, res) => {
  try {
    const { cardNumber, expirationDate, cvv, holderName, cpf } = req.body;

    // Validar campos obrigatórios
    if (!cardNumber || !expirationDate || !cvv || !holderName || !cpf) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos do cartão são obrigatórios'
      });
    }

    // Verificar se o cartão existe e não foi usado
    const card = await CreditCard.findOne({
      number: cardNumber,
      expirationDate,
      cvv,
      holderName,
      cpf,
      isUsed: false
    });

    if (!card) {
      return res.status(400).json({
        success: false,
        message: 'Cartão inválido ou já utilizado'
      });
    }

    // Retornar sucesso
    res.status(200).json({
      success: true,
      message: 'Cartão válido',
      cardId: card._id,
      card: {
        id: card._id,
        lastFour: cardNumber.slice(-4),
        holderName
      }
    });
  } catch (error) {
    console.error('Erro ao validar cartão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao validar cartão'
    });
  }
};

// @desc    Processar pagamento com cartão de crédito
// @route   POST /api/credit-cards/process-payment
// @access  Public
export const processPayment = async (req, res) => {
  try {
    const { cardId, amount, transactionId } = req.body;
    
    // Validar campos obrigatórios
    if (!cardId || !amount || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'ID do cartão, valor e ID da transação são obrigatórios'
      });
    }

    // Validar o valor
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O valor deve ser maior que zero'
      });
    }

    // Buscar o cartão pelo ID
    const card = await CreditCard.findById(cardId);
    
    if (!card) {
      return res.status(400).json({
        success: false,
        message: 'Cartão não encontrado'
      });
    }
    
    if (card.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Cartão já utilizado'
      });
    }

    // Marcar cartão como usado
    card.isUsed = true;
    card.usedBy = transactionId;
    card.usedAt = new Date();
    
    await card.save();

    // Registrar logs para auditoria
    console.log(`Pagamento processado: Cartão ${card._id}, Transação ${transactionId}`);

    res.status(200).json({
      success: true,
      message: 'Pagamento processado com sucesso',
      paymentId: card._id,
      transactionId,
      cardLastFour: card.number.slice(-4)
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar pagamento'
    });
  }
};

// @desc    Obter estatísticas de cartões
// @route   GET /api/credit-cards/stats
// @access  Public
export const getCardStats = async (req, res) => {
  try {
    const totalCards = await CreditCard.countDocuments();
    const usedCards = await CreditCard.countDocuments({ isUsed: true });
    const availableCards = await CreditCard.countDocuments({ isUsed: false });
    
    // Estatísticas por plataforma
    const platforms = await CreditCard.aggregate([
      { $match: { isUsed: true } },
      { $group: { 
          _id: '$platform', 
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estatísticas por data
    const last7Days = await CreditCard.aggregate([
      { $match: { usedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$usedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalCards,
        used: usedCards,
        available: availableCards,
        usageRate: totalCards > 0 ? (usedCards / totalCards * 100).toFixed(2) + '%' : '0%',
        byPlatform: platforms,
        byDate: last7Days
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas de cartões'
    });
  }
};