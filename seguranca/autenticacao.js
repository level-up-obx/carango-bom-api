import geradorDeToken from 'jsonwebtoken';
import { createHash } from 'crypto';

import { usuarioPorEmail } from '../db/banco-json.js';

function criaOpcoesDoToken(idlDoUsuario, expiracao = `${process.env.JWT_EXPIRACAO}`, outrasOpcoes = {}) {
    console.log(`expiracao`, expiracao, typeof expiracao);
    return {
        ...outrasOpcoes,
        issuer: 'Carango Bom API',
        subject: idlDoUsuario,
        expiresIn: expiracao
    };
    
}

function geraToken(usuario) {
    return geradorDeToken.sign(
        { roles: ['ADMINISTRADOR'] }, 
        process.env.JWT_CHAVE, 
        criaOpcoesDoToken(usuario.email)
    );
}

export function autentica(email, senha) {
    const usuario = usuarioPorEmail(email);
    if (!usuario) {
        console.log(`Usuário não encontrado: ${email}`);
        throw new Error(`Credenciais inválidas. Usuário ou senha incorretos.`);
    }

    const hash = createHash('sha256');
    hash.update(senha);

    const senhaCodificada = hash.digest('hex');
    if (usuario.senha != senhaCodificada) {
        console.log(`Tentativa de login inválida ${email}`);
        throw new Error(`Credenciais inválidas. Usuário ou senha incorretos.`);
    }

    return {
        usuario: {
            email: usuario.email,
            nome: usuario.nome
        },
        token: geraToken(usuario)
    };
}

export function recuperaUsuarioDoToken(token) {
    try {
        const validacao = geradorDeToken.verify(token, process.env.JWT_CHAVE);
        return usuarioPorEmail(validacao.sub);
    } catch (erro) {
        console.log(`erro`, erro);
        throw new Error(`Erro ao validar token: ${token}`);
    }
}

export function validaAutenticacao(req, resp, next) {
    const cabecalhoDeAutorizacao = req.header('Authorization');
    if (!cabecalhoDeAutorizacao) {
        resp.status(401).json({ mensagem: 'Autenticação inválida! Token não presente no header Authorization.' });
        return;
    }

    try {
        const token = cabecalhoDeAutorizacao.substring(7);        
        const usuario = recuperaUsuarioDoToken(token);
        req.usuario = usuario;

        next();
    } catch (erro) {
        resp.status(401).json({ mensagem: 'Autenticação inválida! Token inválido.' });
    }
    
};