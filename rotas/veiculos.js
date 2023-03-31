import express, { response } from 'express';
import { v4 as uuid } from 'uuid';

import { validaAutenticacao } from '../seguranca/autenticacao.js';

import { listaVeiculos, cadastraVeiculo, alteraVeiculo, excluiVeiculo, veiculoPorId, marcaPorId } from '../db/banco-json.js';


function validaSeVeiculoExiste(req, resp, next) {
    let veiculo = veiculoPorId(req.params.id);
    if (!veiculo) {
        resp.status(404)
            .json({ mensagem: `Veículo de ID desconhecido: ${req.params.id}`});
        return;
    }

    req.veiculo = veiculo;
    next();
}

function dtoParaVeiculo(req) {
    return {
        id: req.body.id,
        modelo: req.body.modelo,
        marcaId: req.body.marcaId,
        imagemUrl: req.body.imagemUrl,

        ano: parseInt(req.body.ano),
        valor: parseFloat(req.body.valor)
    };
};

function veiculoParaDto(veiculo) {
    let marca = marcaPorId(veiculo.marcaId);

    return {
        id: veiculo.id,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        imagemUrl: veiculo.imagemUrl,
        valor: veiculo.valor,
        marca: marca
    }; 
}


const router = express.Router();
router.get('/veiculos', (req, resp) => {
    let veiculosDto = listaVeiculos()
        .map(veiculoParaDto);

    resp.json({ dados: veiculosDto });
});

router.get('/veiculos/:id', validaSeVeiculoExiste, (req, resp) => {
    resp.json({ dados: veiculoParaDto(req.veiculo) });
});

router.post('/veiculos', validaAutenticacao, (req, resp) => {
    let marca = marcaPorId(req.body.marcaId);
    if (!marca) {
        resp.status(400).json({
            mensagem: `Impossível cadastrar veículo. Marca inexistente: ${req.body.marcaId}`
        })
    }
    let novoVeiculo = dtoParaVeiculo(req);
    novoVeiculo.id = uuid();

    cadastraVeiculo(novoVeiculo)
        .then(() => { 
            resp.sucessoComLocation(`/veiculos/${novoVeiculo.id}`, {
                dados: veiculoParaDto(novoVeiculo),
                mensagem: `Veículo ${novoVeiculo.modelo} cadastrado.`
            });
        });
});

router.delete('/veiculos/:id', validaAutenticacao, validaSeVeiculoExiste, (req, resp) => {
    excluiVeiculo(req.params.id)
        .then(() => resp.json({
            mensagem: `Veículo ${req.params.id} excluído.`
        }));
});

router.put('/veiculos/:id', validaAutenticacao, validaSeVeiculoExiste, (req, resp) => {
    const veiculoParaAlterar = dtoParaVeiculo(req);
    veiculoParaAlterar.id = req.params.id;

    alteraVeiculo(veiculoParaAlterar)
        .then(() => resp.json({
            dados: veiculoParaDto(veiculoParaAlterar),
            mensagem: `Veículo ${veiculoParaAlterar.id} alterado.`
        }));
});

export default router;