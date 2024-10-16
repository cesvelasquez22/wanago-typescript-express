import express, {Request, Response, NextFunction} from 'express';

function loggerMiddleware(request: Request, response: Response, next: NextFunction) {
    console.log(`${request.method} ${request.path}`);
    next();
}

const app = express();

app.use(loggerMiddleware);
 
app.get('/hello', (request, response) => {
  response.send('Hello world!');
});
 
app.listen(5001);
console.log('Server running on http://localhost:5001');