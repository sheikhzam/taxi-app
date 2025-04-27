const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const configureWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    try {
      const token = req.url.split('token=')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      ws.userId = decoded.userId;
      ws.userType = decoded.userType;

      ws.on('message', (message) => {
        console.log(`Received message from ${ws.userType}: ${message}`);
        // Handle different message types here
      });

      ws.send(JSON.stringify({ type: 'connection_success' }));
      

    } catch (error) {
      ws.close(1008, 'Authentication failed');
    }
  });

  return wss;
};

module.exports = configureWebSocket;