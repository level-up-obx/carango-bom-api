import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

import { criaApp } from './app.js';

const variaveis = dotenv.config();
dotenvExpand.expand(variaveis);

const app = criaApp();
app.listen(process.env.PORTA, () => console.log(`Carango Bom API rodando na porta ${process.env.PORTA}...`));
