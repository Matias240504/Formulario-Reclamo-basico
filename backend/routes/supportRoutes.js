const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const Product = require('../models/Product');

// Endpoint para verificar contraseña de administrador
router.post('/admin/verify', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña requerida'
      });
    }
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return res.status(500).json({
        success: false,
        message: 'Configuración de administrador no encontrada'
      });
    }
    
    if (password === adminPassword) {
      res.json({
        success: true,
        message: 'Acceso autorizado'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }
  } catch (error) {
    console.error('Error verificando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST - Crear nuevo ticket de soporte
router.post('/submit', async (req, res) => {
  try {
    const { name, email, product, issueType, message, customProduct } = req.body;

    // Validar datos requeridos básicos
    if (!name || !email || !issueType || !message) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos básicos son requeridos'
      });
    }

    // Validar producto solo si el tipo de problema es hardware
    if (issueType === 'hardware' && !product) {
      return res.status(400).json({
        success: false,
        message: 'El producto es requerido para problemas de hardware'
      });
    }

    let productId = product;

    // Si se seleccionó "other", crear un nuevo producto personalizado
    if (product === 'other') {
      if (!customProduct || !customProduct.name || !customProduct.category || 
          !customProduct.description || !customProduct.manufacturer || !customProduct.supportLevel) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos del producto personalizado son requeridos'
        });
      }

      // Crear el producto personalizado
      const newProduct = new Product({
        name: customProduct.name,
        category: customProduct.category,
        version: customProduct.version || '',
        description: customProduct.description,
        price: customProduct.price || 0,
        status: 'active',
        releaseDate: new Date(),
        manufacturer: customProduct.manufacturer,
        supportLevel: customProduct.supportLevel
      });

      const savedProduct = await newProduct.save();
      productId = savedProduct._id;
    }

    // Crear nuevo ticket
    const newTicket = new SupportTicket({
      name,
      email,
      product: productId,
      issueType,
      message
    });

    const savedTicket = await newTicket.save();

    res.status(201).json({
      success: true,
      message: 'Ticket de soporte creado exitosamente',
      data: {
        id: savedTicket._id,
        name: savedTicket.name,
        email: savedTicket.email,
        issueType: savedTicket.issueType,
        status: savedTicket.status,
        createdAt: savedTicket.createdAt
      }
    });

  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Obtener todos los tickets de soporte con filtros y estadísticas
router.get('/tickets', async (req, res) => {
  try {
    const { status, issueType, limit = 50, page = 1 } = req.query;
    
    // Construir filtros
    const filters = {};
    if (status) filters.status = status;
    if (issueType) filters.issueType = issueType;
    
    // Obtener tickets con paginación
    const skip = (page - 1) * limit;
    const tickets = await SupportTicket.find(filters)
      .populate('product')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Obtener estadísticas
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    
    // Tickets de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTickets = await SupportTicket.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    res.json({
      success: true,
      data: tickets,
      stats: {
        total: totalTickets,
        open: openTickets,
        today: todayTickets
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await SupportTicket.countDocuments(filters)
      }
    });
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener un ticket específico por ID
router.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('product');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error obteniendo ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
