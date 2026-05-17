const dgram = require('dgram');
const EventEmitter = require('events');

class BedrockProxy extends EventEmitter {
  constructor(sessionId, targetIp, targetPort, proxyPort) {
    super();
    
    this.sessionId = sessionId;
    this.targetIp = targetIp;
    this.targetPort = targetPort;
    this.proxyPort = proxyPort;
    
    this.proxySocket = null;
    this.clients = new Map(); // Map of client addresses to their info
    this.isRunning = false;
    this.lastActivity = Date.now();
    
    this.stats = {
      packetsToTarget: 0,
      packetsToClient: 0,
      bytesToTarget: 0,
      bytesToClient: 0,
      connectedClients: 0
    };
  }
  
  async start() {
    return new Promise((resolve, reject) => {
      this.proxySocket = dgram.createSocket('udp4');
      
      this.proxySocket.on('error', (err) => {
        console.error(`Proxy error on port ${this.proxyPort}:`, err);
        this.emit('error', err);
        reject(err);
      });
      
      this.proxySocket.on('message', (msg, rinfo) => {
        this.handleClientPacket(msg, rinfo);
      });
      
      this.proxySocket.bind(this.proxyPort, '0.0.0.0', () => {
        this.isRunning = true;
        console.log(`✓ Bedrock proxy started on port ${this.proxyPort}`);
        console.log(`  → Forwarding to ${this.targetIp}:${this.targetPort}`);
        this.emit('started');
        resolve();
      });
    });
  }
  
  handleClientPacket(msg, rinfo) {
    this.lastActivity = Date.now();
    
    const clientKey = `${rinfo.address}:${rinfo.port}`;
    
    // Track client if new
    if (!this.clients.has(clientKey)) {
      console.log(`✓ New client connected: ${clientKey}`);
      
      const clientSocket = dgram.createSocket('udp4');
      
      clientSocket.on('message', (serverMsg) => {
        // Forward from target server back to client
        this.proxySocket.send(serverMsg, rinfo.port, rinfo.address, (err) => {
          if (err) {
            console.error('Error forwarding to client:', err);
          } else {
            this.stats.packetsToClient++;
            this.stats.bytesToClient += serverMsg.length;
          }
        });
      });
      
      clientSocket.on('error', (err) => {
        console.error(`Client socket error for ${clientKey}:`, err);
      });
      
      this.clients.set(clientKey, {
        address: rinfo.address,
        port: rinfo.port,
        socket: clientSocket,
        connectedAt: Date.now(),
        lastSeen: Date.now()
      });
      
      this.stats.connectedClients = this.clients.size;
      this.emit('clientConnected', { clientKey, address: rinfo.address, port: rinfo.port });
    } else {
      // Update last seen
      this.clients.get(clientKey).lastSeen = Date.now();
    }
    
    // Forward packet to target server
    const client = this.clients.get(clientKey);
    client.socket.send(msg, this.targetPort, this.targetIp, (err) => {
      if (err) {
        console.error('Error forwarding to target:', err);
      } else {
        this.stats.packetsToTarget++;
        this.stats.bytesToTarget += msg.length;
        this.emit('packetForwarded', {
          direction: 'toTarget',
          size: msg.length
        });
      }
    });
  }
  
  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.lastActivity,
      isRunning: this.isRunning
    };
  }
  
  async stop() {
    if (!this.isRunning) return;
    
    console.log(`Stopping proxy on port ${this.proxyPort}...`);
    
    // Close all client sockets
    for (const [clientKey, client] of this.clients.entries()) {
      try {
        client.socket.close();
      } catch (err) {
        console.error(`Error closing client socket ${clientKey}:`, err);
      }
    }
    this.clients.clear();
    
    // Close proxy socket
    return new Promise((resolve) => {
      if (this.proxySocket) {
        this.proxySocket.close(() => {
          this.isRunning = false;
          console.log(`✓ Proxy stopped on port ${this.proxyPort}`);
          this.emit('stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  
  isInactive(timeout) {
    return Date.now() - this.lastActivity > timeout;
  }
}

module.exports = BedrockProxy;