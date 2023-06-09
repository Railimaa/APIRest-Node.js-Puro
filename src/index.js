const http = require('http');
const url  = require('url');

const bodyParser = require('./helpers/bodyParser')
const routes = require('./routes')


const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true)                                                                       //new URL(`http://localhost:8000${request.url}`)
  console.log(`Request method: ${request.method} | Endpoint: ${parsedUrl.pathname}`)

  let { pathname } = parsedUrl;
  let id = null

  const splitEndPoint = pathname.split('/').filter(Boolean);

  if(splitEndPoint.length > 1) {
    pathname = `/${splitEndPoint[0]}/:id`;
    id = splitEndPoint[1];
  }

  const route = routes.find((routeObj) => (
    routeObj.endpoint === pathname && routeObj.method === request.method
  ))

  if(route) {
    request.query = parsedUrl.query;
    request.params = { id }; 

    response.send = (statusCode, body) => {
      response.writeHead(statusCode, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(body))
    }

    if(['POST', 'PUT', 'PATCH'].includes(request.method)) {
      bodyParser(request, () => route.handler(request, response))
    } else {
      route.handler(request, response)
    }

    
  } else {
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end(`Cannot ${request.method} ${parsedUrl.pathname}`)
  }
});

server.listen(8000, () => {
  console.log('Server start at http://localhost:8000')
}) 