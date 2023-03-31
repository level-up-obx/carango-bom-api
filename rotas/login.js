import express from 'express';
import { autentica, recuperaUsuarioDoToken, validaAutenticacao } from '../seguranca/autenticacao.js';

const router = express.Router();
router.post('/login', (req, resp) => {

    try {
        const autenticacao = autentica(req.body.email, req.body.senha);
        resp.json({ dados: autenticacao });      
    } catch (erro) {
        resp.status(401).json({ mensagem: erro.message });
    }
});

router.get('/usuario', validaAutenticacao, (req, resp) => {
    resp.json({
        dados: req.usuario
    });
});

export default router;