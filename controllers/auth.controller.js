// controllers/auth.controller.js
import Platform from '../models/platform.model.js';
import crypto from 'crypto';

// @desc    Registrar nova plataforma
// @route   POST /api/auth/register
// @access  Private (Admin)
export const registerPlatform = async (req, res) => {
  try {
    const { name, ipWhitelist, rateLimitPerMinute } = req.body;

    // Verificar se o nome é fornecido
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome da plataforma é obrigatório'
      });
    }

    // Verificar se a plataforma já existe
    const existingPlatform = await Platform.findOne({ name });
    if (existingPlatform) {
      return res.status(400).json({
        success: false,
        message: 'Uma plataforma com este nome já existe'
      });
    }

    // Criar nova plataforma
    const platform = await Platform.create({
      name,
      ipWhitelist: ipWhitelist || [],
      rateLimitPerMinute: rateLimitPerMinute || 60,
      apiKey: crypto.randomBytes(16).toString('hex'),
      secretKey: crypto.randomBytes(32).toString('hex')
    });

    res.status(201).json({
      success: true,
      message: 'Plataforma registrada com sucesso',
      platform: {
        id: platform._id,
        name: platform.name,
        apiKey: platform.apiKey,
        secretKey: platform.secretKey,
        ipWhitelist: platform.ipWhitelist,
        rateLimitPerMinute: platform.rateLimitPerMinute,
        status: platform.status
      },
      warning: 'Guarde a Secret Key em um local seguro. Ela não será mostrada novamente.'
    });
  } catch (error) {
    console.error('Erro ao registrar plataforma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar plataforma'
    });
  }
};

// @desc    Gerar novas chaves para plataforma
// @route   POST /api/auth/regenerate-keys
// @access  Private (Admin)
export const regenerateKeys = async (req, res) => {
  try {
    const { platformId } = req.body;

    if (!platformId) {
      return res.status(400).json({
        success: false,
        message: 'ID da plataforma é obrigatório'
      });
    }

    const platform = await Platform.findById(platformId);
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Plataforma não encontrada'
      });
    }

    // Gerar novas chaves
    platform.apiKey = crypto.randomBytes(16).toString('hex');
    platform.secretKey = crypto.randomBytes(32).toString('hex');
    await platform.save();

    res.json({
      success: true,
      message: 'Chaves regeneradas com sucesso',
      platform: {
        id: platform._id,
        name: platform.name,
        apiKey: platform.apiKey,
        secretKey: platform.secretKey
      },
      warning: 'Guarde a nova Secret Key em um local seguro. Ela não será mostrada novamente.'
    });
  } catch (error) {
    console.error('Erro ao regenerar chaves:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao regenerar chaves'
    });
  }
};

// @desc    Listar todas as plataformas
// @route   GET /api/auth/platforms
// @access  Private (Admin)
export const listPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find().select('-secretKey');
    
    res.json({
      success: true,
      count: platforms.length,
      platforms
    });
  } catch (error) {
    console.error('Erro ao listar plataformas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar plataformas'
    });
  }
};

// @desc    Atualizar status da plataforma
// @route   PUT /api/auth/platforms/:id/status
// @access  Private (Admin)
export const updatePlatformStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Deve ser active, inactive ou suspended.'
      });
    }
    
    const platform = await Platform.findById(req.params.id);
    
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Plataforma não encontrada'
      });
    }
    
    platform.status = status;
    await platform.save();
    
    res.json({
      success: true,
      message: 'Status da plataforma atualizado com sucesso',
      platform: {
        id: platform._id,
        name: platform.name,
        status: platform.status
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status da plataforma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status da plataforma'
    });
  }
};

// @desc    Atualizar IP whitelist da plataforma
// @route   PUT /api/auth/platforms/:id/ip-whitelist
// @access  Private (Admin)
export const updateIpWhitelist = async (req, res) => {
  try {
    const { ipWhitelist } = req.body;
    
    if (!Array.isArray(ipWhitelist)) {
      return res.status(400).json({
        success: false,
        message: 'ipWhitelist deve ser um array'
      });
    }
    
    const platform = await Platform.findById(req.params.id);
    
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Plataforma não encontrada'
      });
    }
    
    platform.ipWhitelist = ipWhitelist;
    await platform.save();
    
    res.json({
      success: true,
      message: 'IP whitelist atualizado com sucesso',
      platform: {
        id: platform._id,
        name: platform.name,
        ipWhitelist: platform.ipWhitelist
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar IP whitelist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar IP whitelist'
    });
  }
};