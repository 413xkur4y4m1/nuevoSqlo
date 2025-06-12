const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Endpoint para obtener configuración de Azure AD
app.get('/api/azure-config', (req, res) => {
    res.json({
        tenantId: process.env.TENANT_ID,
        clientId: process.env.CLIENT_ID,
        redirectUri: 'https://bdsql-9416f.web.app/auth-callback' // URL registrada en Azure AD
    });
});

// Endpoint para manejar el callback de autenticación
app.get('/auth-callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('No se recibió código de autorización');
    }

    try {
        const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
        const params = new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,            code: code,
            redirect_uri: 'https://bdsql-9416f.web.app/auth-callback', // URL registrada en Azure AD
            grant_type: 'authorization_code'
        });

        const response = await axios.post(tokenUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Redirigir a la página de préstamos con el token
        res.redirect(`/sistema-prestamos.html#token=${response.data.access_token}`);
    } catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).send('Error en autenticación');
    }
});

// Función para obtener el token de acceso
async function getAccessToken() {
    const url = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: process.env.REFRESH_TOKEN,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/.default'
    });
    try {
        const res = await axios.post(url, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return res.data.access_token;
    } catch (err) {
        console.error('Error al obtener el access token:', err.response?.data || err.message);
        throw new Error(err.response?.data?.error_description || err.message);
    }
}

// Endpoint para enviar correos
app.post('/api/send-email', async (req, res) => {
    const { correo, asunto, mensaje } = req.body;
    if (!correo || !asunto || !mensaje) {
        return res.status(400).json({ 
            success: false, 
            message: 'Falta información requerida para enviar el correo' 
        });
    }

    let accessToken;
    try {
        accessToken = await getAccessToken();
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: 'Error al obtener el access token', 
            error: err.message 
        });
    }

    const bodyHtml = `<div style="font-family: Arial, sans-serif;">${mensaje.replace(/\n/g, '<br>')}</div>`;

    const emailData = {
        message: {
            subject: asunto,
            body: {
                contentType: "HTML",
                content: bodyHtml
            },
            toRecipients: [
                { emailAddress: { address: correo } }
            ],
            from: {
                emailAddress: { address: process.env.EMAIL_USER }
            }
        },
        saveToSentItems: "true"
    };

    try {
        const graphUrl = `https://graph.microsoft.com/v1.0/users/${process.env.EMAIL_USER}/sendMail`;
        await axios.post(graphUrl, emailData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        res.status(200).json({ 
            success: true, 
            message: `Correo enviado exitosamente a ${correo}` 
        });
    } catch (error) {
        console.error('Error al enviar el correo:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error al enviar el correo', 
            error: error.response?.data || error.message 
        });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});