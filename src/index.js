import app from './app';
import './database';

const port = app.get('port');
const host = app.get('host');

app.listen.port = port;
app.listen.host = host;

console.log('Server listen on: ',host,':', port);
