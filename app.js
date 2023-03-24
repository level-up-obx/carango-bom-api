import express from "express";

import login from "./rotas/login.js";
import marcas from "./rotas/marcas.js";
import veiculos from "./rotas/veiculos.js";
import dashboard from "./rotas/dashboard.js";

function sucessoComLocation(req, resp, next) {
    const resposta = resp;

    resposta.sucessoComLocation = function(uri, dados) {
        resposta.append('Location', `${process.env.BASE_URL}${uri}`);
        resposta.status(201).json(dados);
    };
    
    next();
}

export function criaApp() {
    const app = express();
    app.use(express.json());
    app.use(sucessoComLocation);
    
    app.use(process.env.CONTEXTO, login);
    app.use(process.env.CONTEXTO, marcas);
    app.use(process.env.CONTEXTO, veiculos);
    app.use(process.env.CONTEXTO, dashboard);
    
    app.get('/', (req, res) => res.send('Olá, Express!'));

    return app;
};
