# Backend del Formulario de Soporte

Este es el backend para el formulario de contacto de soporte, construido con Node.js, Express y MongoDB.

## Instalación

1. Navega a la carpeta backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia el archivo `.env` y ajusta la URL de MongoDB según tu configuración
   - Para MongoDB local: `mongodb://localhost:27017/support_form_db`
   - Para MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/support_form_db`

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## Endpoints de la API

### POST /api/support/submit
Crea un nuevo ticket de soporte.

**Body:**
```json
{
  "name": "Nombre del usuario",
  "email": "email@ejemplo.com",
  "issueType": "technical|billing|account|feature|other",
  "message": "Descripción del problema"
}
```

### GET /api/support/tickets
Obtiene todos los tickets de soporte.

### GET /api/support/tickets/:id
Obtiene un ticket específico por ID.

## Estructura del Proyecto

```
backend/
├── config/
│   └── database.js      # Configuración de MongoDB
├── models/
│   └── SupportTicket.js # Modelo de datos
├── routes/
│   └── supportRoutes.js # Rutas de la API
├── server.js            # Servidor principal
├── package.json         # Dependencias
├── .env                 # Variables de entorno
└── README.md           # Este archivo
```

## Requisitos

- Node.js 14+
- MongoDB (local o Atlas)
- npm o yarn
