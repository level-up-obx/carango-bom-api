import express from 'express';
import { listaVeiculos, listaMarcas } from '../db/banco-json.js';
import { validaAutenticacao } from '../seguranca/autenticacao.js';


const router = express.Router();
router.get('/dashboard', validaAutenticacao, (req, resp) => {
    let marcas = listaMarcas();
    let veiculos = listaVeiculos();

    const dadosAgrupados = marcas.reduce((registros, marca) => {
        const veiculosDaMarca = veiculos.filter(v => v.marcaId == marca.id);
        
        const quantidade = veiculosDaMarca.length;
        const montante = veiculosDaMarca.reduce((soma, veiculo) => soma + veiculo.valor, 0);

        return [
            ...registros,
            { marca: marca.nome, quantidade, montante }
        ];
    }, []);
    
    
    resp.json({ dados: dadosAgrupados });
});

export default router;
