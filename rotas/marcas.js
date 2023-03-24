import express, { response } from 'express';
import { v4 as uuid } from 'uuid';

import * as banco from '../db/banco-json.js';
import { validaAutenticacao } from '../seguranca/autenticacao.js';


function validaSeMarcaExiste(req, resp, next) {
    let marca = banco.marcaPorId(req.params.id);
    if (!marca) {
        resp.status(404)
            .json({ mensagem: `Marca de ID desconhecido: ${req.params.id}`});
        return;
    }

    req.marca = marca;
    next();
}


const router = express.Router();
router.get('/marcas', (req, resp) => {
    resp.json({ dados: banco.listaMarcas() });
});

router.post('/marcas', validaAutenticacao, (req, resp) => {
    let novaMarca = {
        id: uuid(),
        nome: req.body.nome
    };

    banco.cadastraMarca(novaMarca)
        .then(() => { 
            resp.sucessoComLocation(`/marcas/${novaMarca.id}`, {
                dados: novaMarca,
                mensagem: `Marca ${novaMarca.nome} cadastrada.`
            });
        });
});

router.delete('/marcas/:id', validaAutenticacao, validaSeMarcaExiste, (req, resp) => {
    if (banco.existeVeiculoVinculadoAMarca(req.params.id)) {
        resp.status(409).json({ mensagem: 'Não é possível excluir marca. Existe veículo vinculado a ela.' });
        return;
    }

    banco.excluiMarca(req.params.id)
        .then(() => resp.json({
            mensagem: `Marca ${req.params.id} excluída.`
        }))
        .catch();
});

router.put('/marcas/:id', validaAutenticacao, validaSeMarcaExiste, (req, resp) => {
    const marcaParaAlterar = req.marca;
    marcaParaAlterar.nome = req.body.nome;

    banco.alteraMarca(marcaParaAlterar)
        .then(() => resp.json({
            dados: marcaParaAlterar,
            mensagem: `Marca ${marcaParaAlterar.id} alterada.`
        }));
});

export default router;