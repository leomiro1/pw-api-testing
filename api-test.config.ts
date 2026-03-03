import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const processENV = process.env.TEST_ENV
const env = processENV || 'prod' // 'qa','dev','prod'
console.log('Test environment is: ' + env)

const config  ={
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: 'pwtest@test.com',
    userPassword: 'Welcome2'
}

if (env === 'qa'){
    config.userEmail = 'pwapiuser@test.com',
    config.userPassword = 'Welcome'
}

if (env === 'prod'){
    //if (!process.env.PROD_USERNAME || !process.env.PROD_PASSWORD){
    //    throw Error('Missing required environment variables')
    //}
    config.userEmail = process.env.PROD_USERNAME as string,
    config.userPassword = process.env.PROD_PASSWORD as string
}

export {config}