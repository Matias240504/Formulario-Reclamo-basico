const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const Product = require('../models/Product');

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

// GET - Obtener todos los tickets
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('product', 'name category version manufacturer')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Obtener ticket por ID
router.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    
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
