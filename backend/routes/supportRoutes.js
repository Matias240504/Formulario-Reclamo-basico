const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const Product = require('../models/Product');
const nodemailer = require('nodemailer');

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

// PUT - Actualizar estado de un ticket
router.put('/tickets/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    // Validar que el estado sea válido
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ')
      });
    }

    // Buscar y actualizar el ticket
    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('product');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estado del ticket actualizado exitosamente',
      data: ticket
    });

  } catch (error) {
    console.error('Error actualizando estado del ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST - Enviar email de notificación al usuario
router.post('/tickets/:id/send-email', async (req, res) => {
  try {
    const { subject, message } = req.body;
    const ticketId = req.params.id;

    // Validar datos requeridos
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Asunto y mensaje son requeridos'
      });
    }

    // Buscar el ticket
    const ticket = await SupportTicket.findById(ticketId).populate('product');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verificar configuración de email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Configuración de email no encontrada, simulando envío...');
      const emailData = {
        to: ticket.email,
        subject: subject,
        message: message,
        ticketId: ticket._id,
        sentAt: new Date()
      };
      console.log('Email que se enviaría:', emailData);
    } else {
      // Enviar email real
      try {
        await transporter.sendMail({
          from: `${process.env.EMAIL_FROM_NAME || 'Sistema de Soporte'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
          to: ticket.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1e40af; margin: 0;">${subject}</h2>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p>Estimado/a <strong>${ticket.name}</strong>,</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #374151; margin-top: 0;">Información del ticket:</h3>
                <p style="margin: 5px 0;"><strong>ID del ticket:</strong> #${ticket._id.toString().slice(-8)}</p>
                <p style="margin: 5px 0;"><strong>Estado actual:</strong> ${ticket.status}</p>
                <p style="margin: 5px 0;"><strong>Tipo de problema:</strong> ${ticket.issueType}</p>
                ${ticket.product ? `<p style="margin: 5px 0;"><strong>Producto:</strong> ${ticket.product.name}</p>` : ''}
                <p style="margin: 5px 0;"><strong>Fecha de creación:</strong> ${new Date(ticket.createdAt).toLocaleString('es-ES')}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  Este es un mensaje automático del sistema de soporte. Por favor no responda a este email.
                </p>
              </div>
            </div>
          `
        });
        console.log(`Email enviado exitosamente a ${ticket.email}`);
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
        throw new Error('Error al enviar el email: ' + emailError.message);
      }
    }

    res.json({
      success: true,
      message: 'Email enviado exitosamente',
      data: {
        recipient: ticket.email,
        subject: subject,
        sentAt: new Date(),
        ticketInfo: {
          id: ticket._id,
          name: ticket.name,
          status: ticket.status,
          issueType: ticket.issueType,
          product: ticket.product ? ticket.product.name : null
        }
      }
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
