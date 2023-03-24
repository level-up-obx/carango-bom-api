import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')

const adapter = new JSONFile(file)
const jsonDb = new Low(adapter)


await jsonDb.read()

jsonDb.data = jsonDb.data || { 
    marcas: {},
    veiculos: {},
    usuarios: {
        'fulano@email.com': {
            email: 'fulano@email.com',
            nome: 'Fulano de Tal do Vue.js',
            senha: '123'
        }

    }
};

function criaCrud(db, colecao) {

    function listaTodos() {
        return Object.entries(db.data[colecao]).map(([chave, valor]) => valor);
    };
    
    function cadastra(entidade) {
            db.data[colecao][entidade.id] = entidade;
            return db.write();
    };

    function exclui(id) {
        delete db.data[colecao][id];
        return db.write();
    };

    function altera(entidade) {
        db.data[colecao][entidade.id] = entidade;
        return db.write();
    };

    function pesquisaPorId(id) {
        return db.data[colecao][id];
    };

    return { listaTodos, cadastra, exclui, altera, pesquisaPorId };

};

const { 
    listaTodos: listaMarcas,
    cadastra: cadastraMarca,
    altera: alteraMarca,
    pesquisaPorId: marcaPorId,
    exclui: excluiMarca
} = criaCrud(jsonDb, 'marcas');

const { 
    listaTodos: listaVeiculos,
    cadastra: cadastraVeiculo,
    altera: alteraVeiculo,
    pesquisaPorId: veiculoPorId,
    exclui: excluiVeiculo
} = criaCrud(jsonDb, 'veiculos');


function existeVeiculoVinculadoAMarca(marcaId) {
    return listaVeiculos().find(veiculo => veiculo.marcaId == marcaId) != undefined;
}

export const {
    pesquisaPorId: usuarioPorEmail
} = criaCrud(jsonDb, 'usuarios');

export { 
    listaMarcas, 
    cadastraMarca, 
    alteraMarca, 
    marcaPorId, 
    excluiMarca,
    
    listaVeiculos, 
    cadastraVeiculo,
    alteraVeiculo, 
    veiculoPorId, 
    excluiVeiculo,
    existeVeiculoVinculadoAMarca
};