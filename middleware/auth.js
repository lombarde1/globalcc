// middleware/auth.js
import Platform from '../models/platform.model.js';

// Verificar API key para autenticação da plataforma
export const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key não fornecida'
      });
    }

    const platform = await Platform.findOne({ apiKey, status: 'active' });
    
    if (!platform) {
      return res.status(401).json({
        success: false,
        message: 'API key inválida ou plataforma inativa'
      });
    }

    // Verificar IP whitelist se configurado
    if (platform.ipWhitelist && platform.ipWhitelist.length > 0) {
      const clientIp = req.ip || req.connection.remoteAddress;
      
      if (!platform.ipWhitelist.includes(clientIp)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso não autorizado para este IP'
        });
      }
    }

    // Atualizar timestamp de último acesso
    platform.lastAccessedAt = new Date();
    await platform.save();
    
    // Adicionar informações da plataforma ao request
    req.platform = {
      id: platform._id,
      name: platform.name
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na autenticação'
    });
  }
};

// Verificar permissões de admin
export const isAdmin = async (req, res, next) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na verificação de permissões'
    });
  }
};