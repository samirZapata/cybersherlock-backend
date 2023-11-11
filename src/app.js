import express from 'express';
import morgan from 'morgan';
import pkg from '../package.json'

import {createRoles} from './libs/initialSetup';

import casesRoutes from './routes/case.route';
import authRoutes from './routes/auth.route';



const app = express();
const port = process.env.PORT || 9000;
const host = process.env.HOST || '0.0.0.0'
createRoles(); //ESTABLECE LOS ROLES PREDEFINIDOS

app.set('port',port);
//app.set('host',host);

app.use(morgan('dev'));
app.set('pkg', pkg);
app.use(express.json());

app.get('/', (req, res)=>{
    res.json({
        name: app.get('pkg').name,
        author: app.get('pkg').author,
        description: app.get('pkg').description,
        version: app.get('pkg').version
    })
})

app.use('/api/cases', casesRoutes);
app.use('/api/auth', authRoutes);






export default app;

