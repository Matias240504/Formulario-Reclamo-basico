const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET - Obtener todos los productos activos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .select('_id name category version price manufacturer supportLevel')
      .sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Obtener productos por categoría
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ 
      category: category,
      status: 'active' 
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
