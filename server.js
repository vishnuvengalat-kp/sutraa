const http = require('http');
const server = http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end('<h1>SUTRA Loading...</h1>');});
server.listen(process.env.PORT||3000,()=>console.log('Running'));
