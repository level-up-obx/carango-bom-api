import express from 'express';
import { autentica, recuperaUsuarioDoToken } from '../seguranca/autenticacao.js';

const router = express.Router();
router.post('/login', (req, resp) => {

    try {
        const autenticacao = autentica(req.body.email, req.body.senha);
        resp.json({ dados: autenticacao });      
    } catch (erro) {
        resp.status(401).json({ mensagem: erro.message });
    }
});

export default router;