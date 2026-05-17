const config = require('../config/config');

class PortAllocator {
  constructor() {
    this.allocatedPorts = new Set();
    this.portStart = config.proxy.portStart;
    this.portEnd = config.proxy.portEnd;
  }
  
  allocate() {
    for (let port = this.portStart; port <= this.portEnd; port++) {
      if (!this.allocatedPorts.has(port)) {
        this.allocatedPorts.add(port);
        console.log(`✓ Allocated port: ${port}`);
        return port;
      }
    }
    
    throw new Error('No available ports');
  }
  
  release(port) {
    if (this.allocatedPorts.has(port)) {
      this.allocatedPorts.delete(port);
      console.log(`✓ Released port: ${port}`);
      return true;
    }
    return false;
  }
  
  isAllocated(port) {
    return this.allocatedPorts.has(port);
  }
  
  getAvailableCount() {
    return (this.portEnd - this.portStart + 1) - this.allocatedPorts.size;
  }
  
  getAllocatedCount() {
    return this.allocatedPorts.size;
  }
}

module.exports = new PortAllocator();