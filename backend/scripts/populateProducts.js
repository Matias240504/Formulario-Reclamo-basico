const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const products = [
  {
    name: "Microsoft Office 365 Business Premium",
    category: "Software",
    version: "2024",
    description: "Suite completa de productividad empresarial con Word, Excel, PowerPoint, Outlook y Teams",
    price: 299.99,
    status: "active",
    releaseDate: new Date("2024-01-15"),
    manufacturer: "Microsoft",
    supportLevel: "premium"
  },
  {
    name: "Adobe Creative Cloud",
    category: "Software",
    version: "2024",
    description: "Conjunto completo de aplicaciones creativas incluyendo Photoshop, Illustrator, Premiere Pro",
    price: 599.99,
    status: "active",
    releaseDate: new Date("2024-02-01"),
    manufacturer: "Adobe",
    supportLevel: "enterprise"
  },
  {
    name: "Dell OptiPlex 7090",
    category: "Hardware",
    version: "Tower",
    description: "PC de escritorio empresarial con procesador Intel Core i7, 16GB RAM, 512GB SSD",
    price: 1299.99,
    status: "active",
    releaseDate: new Date("2023-06-15"),
    manufacturer: "Dell",
    supportLevel: "estándar"
  },
  {
    name: "HP LaserJet Pro M404n",
    category: "Hardware",
    version: "M404n",
    description: "Impresora láser monocromática de alta velocidad para oficina",
    price: 249.99,
    status: "active",
    releaseDate: new Date("2023-03-10"),
    manufacturer: "HP",
    supportLevel: "básico"
  },
  {
    name: "Cisco Webex Meetings",
    category: "Servicios",
    version: "Pro",
    description: "Plataforma de videoconferencias y colaboración empresarial",
    price: 149.99,
    status: "active",
    releaseDate: new Date("2023-09-01"),
    manufacturer: "Cisco",
    supportLevel: "premium"
  },
  {
    name: "Windows 11 Pro",
    category: "Licencias",
    version: "22H2",
    description: "Sistema operativo profesional con características avanzadas de seguridad",
    price: 199.99,
    status: "active",
    releaseDate: new Date("2023-10-31"),
    manufacturer: "Microsoft",
    supportLevel: "estándar"
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    category: "Hardware",
    version: "Gen 11",
    description: "Laptop empresarial ultraliviana con pantalla 14 pulgadas y procesador Intel vPro",
    price: 1899.99,
    status: "active",
    releaseDate: new Date("2024-01-20"),
    manufacturer: "Lenovo",
    supportLevel: "premium"
  },
  {
    name: "Soporte Técnico Premium",
    category: "Soporte",
    version: "24/7",
    description: "Soporte técnico especializado disponible las 24 horas del día",
    price: 99.99,
    status: "active",
    releaseDate: new Date("2023-01-01"),
    manufacturer: "TechSupport Inc",
    supportLevel: "enterprise"
  },
  {
    name: "Antivirus Kaspersky Total Security",
    category: "Software",
    version: "2024",
    description: "Protección completa contra malware, ransomware y amenazas online",
    price: 79.99,
    status: "active",
    releaseDate: new Date("2024-03-15"),
    manufacturer: "Kaspersky",
    supportLevel: "estándar"
  },
  {
    name: "Samsung Monitor 27 4K",
    category: "Hardware",
    version: "U28E590D",
    description: "Monitor 4K UHD de 27 pulgadas con tecnología AMD FreeSync",
    price: 399.99,
    status: "active",
    releaseDate: new Date("2023-08-20"),
    manufacturer: "Samsung",
    supportLevel: "básico"
  },
  {
    name: "Slack Business+",
    category: "Servicios",
    version: "Business+",
    description: "Plataforma de comunicación empresarial con funciones avanzadas",
    price: 12.50,
    status: "active",
    releaseDate: new Date("2023-05-10"),
    manufacturer: "Slack Technologies",
    supportLevel: "premium"
  },
  {
    name: "AutoCAD 2024",
    category: "Licencias",
    version: "2024",
    description: "Software de diseño asistido por computadora para arquitectura e ingeniería",
    price: 1690.00,
    status: "active",
    releaseDate: new Date("2024-03-29"),
    manufacturer: "Autodesk",
    supportLevel: "enterprise"
  },
  {
    name: "Logitech MX Master 3S",
    category: "Hardware",
    version: "MX Master 3S",
    description: "Mouse inalámbrico ergonómico de alta precisión para profesionales",
    price: 99.99,
    status: "active",
    releaseDate: new Date("2023-07-15"),
    manufacturer: "Logitech",
    supportLevel: "básico"
  },
  {
    name: "Zoom Pro",
    category: "Servicios",
    version: "Pro",
    description: "Servicio de videoconferencias profesional con hasta 100 participantes",
    price: 14.99,
    status: "active",
    releaseDate: new Date("2023-04-01"),
    manufacturer: "Zoom Video Communications",
    supportLevel: "estándar"
  },
  {
    name: "McAfee Total Protection",
    category: "Software",
    version: "2024",
    description: "Suite de seguridad integral con VPN, gestor de contraseñas y protección web",
    price: 89.99,
    status: "active",
    releaseDate: new Date("2024-02-14"),
    manufacturer: "McAfee",
    supportLevel: "estándar"
  },
  {
    name: "Canon PIXMA TS8320",
    category: "Hardware",
    version: "TS8320",
    description: "Impresora multifunción de inyección de tinta con conectividad inalámbrica",
    price: 199.99,
    status: "active",
    releaseDate: new Date("2023-11-05"),
    manufacturer: "Canon",
    supportLevel: "básico"
  },
  {
    name: "Consultoría IT Empresarial",
    category: "Servicios",
    version: "Premium",
    description: "Servicios de consultoría especializada en transformación digital",
    price: 150.00,
    status: "active",
    releaseDate: new Date("2023-01-15"),
    manufacturer: "IT Consultants Pro",
    supportLevel: "enterprise"
  },
  {
    name: "Visual Studio Professional 2022",
    category: "Licencias",
    version: "2022",
    description: "Entorno de desarrollo integrado para aplicaciones empresariales",
    price: 499.00,
    status: "active",
    releaseDate: new Date("2023-11-08"),
    manufacturer: "Microsoft",
    supportLevel: "premium"
  },
  {
    name: "Seagate Backup Plus 2TB",
    category: "Hardware",
    version: "STHN2000400",
    description: "Disco duro externo portátil de 2TB con software de respaldo automático",
    price: 79.99,
    status: "active",
    releaseDate: new Date("2023-09-20"),
    manufacturer: "Seagate",
    supportLevel: "básico"
  },
  {
    name: "Salesforce Essentials",
    category: "Servicios",
    version: "Essentials",
    description: "CRM en la nube para pequeñas y medianas empresas",
    price: 25.00,
    status: "active",
    releaseDate: new Date("2023-12-01"),
    manufacturer: "Salesforce",
    supportLevel: "premium"
  }
];

async function populateProducts() {
  try {
    // Limpiar productos existentes
    await Product.deleteMany({});
    console.log('Productos existentes eliminados');

    // Insertar nuevos productos
    const insertedProducts = await Product.insertMany(products);
    console.log(`${insertedProducts.length} productos insertados exitosamente`);

    // Mostrar algunos productos insertados
    console.log('\nPrimeros 5 productos insertados:');
    insertedProducts.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.category} - $${product.price}`);
    });

  } catch (error) {
    console.error('Error poblando productos:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nConexión a MongoDB cerrada');
  }
}

// Ejecutar el script
populateProducts();
