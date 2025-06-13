const express = require('express');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Configurar el transporter de correo
const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// API para envío de correos
app.post('/api/send-email', async (req, res) => {
    try {
        const { correo, asunto, mensaje } = req.body;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: correo,
            subject: asunto,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    ${mensaje}
                    <br><br>
                    <img src="https://413xkur4y4m1.github.io/Prestamos.io/log.jpeg" alt="Notification Image" style="max-width: 100%; height: auto;">
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Correo enviado exitosamente' });
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al enviar el correo',
            error: error.message 
        });
    }
});

// API para verificar usuario de Microsoft
app.get('/api/verify-user', async (req, res) => {
    const correo = req.query.correo;
    console.log('Verificando correo:', correo);

    try {
        if (!correo) {
            return res.status(400).json({ error: 'Correo no proporcionado' });
        }

        // Obtener token de Microsoft
        const tokenResponse = await fetch(
            `https://login.microsoftonline.com/888b0e26-077a-469a-a7a9-03dbf899b973/oauth2/v2.0/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: '3da09b62-fd51-49a0-87b8-991c9c528bc4',
                    client_secret: 'M6-8Q~4OArQ_2B-3CWl_xgAU62V40Erzfmv52bM1',
                    scope: 'https://graph.microsoft.com/.default User.Read.All User.ReadBasic.All'
                })
            }
        );

        const tokenData = await tokenResponse.json();
        console.log('Token obtenido');

        if (!tokenData.access_token) {
            console.error('Error al obtener token:', tokenData);
            return res.status(500).json({ error: 'Error al obtener acceso' });
        }        // Buscar usuario en Microsoft Graph
        const graphResponse = await fetch(
            `https://graph.microsoft.com/v1.0/users/${correo}?$select=displayName,userPrincipalName`,
            {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'ConsistencyLevel': 'eventual'
                }
            }
        );const graphData = await graphResponse.json();
        
        if (!graphResponse.ok) {
            console.log('Error en Microsoft Graph:', graphResponse.status, graphData);
            return res.status(404).json({ 
                error: 'Usuario no encontrado',
                details: graphData
            });
        }

        const userData = graphData;
        console.log('Usuario encontrado:', userData.displayName);

        res.json({
            nombre: userData.displayName,
            correo: userData.userPrincipalName
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});