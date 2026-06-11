// dsa.js - Custom DSA implementations for the Smart Hostel Complaint Platform

// ==========================================
// 1. PRIORITY QUEUE (Binary Max-Heap)
// ==========================================
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    // Compare two complaints. Returns true if a has higher priority than b.
    // Urgency level is primary key, timestamp (older first) is secondary key.
    compare(a, b) {
        if (a.priorityCode !== b.priorityCode) {
            return a.priorityCode > b.priorityCode;
        }
        return a.timestamp < b.timestamp; // Older timestamp has higher priority
    }

    parent(i) { return Math.floor((i - 1) / 2); }
    leftChild(i) { return 2 * i + 1; }
    rightChild(i) { return 2 * i + 2; }

    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    insert(complaint) {
        this.heap.push(complaint);
        this.heapifyUp(this.heap.length - 1);
    }

    heapifyUp(i) {
        while (i > 0 && this.compare(this.heap[i], this.heap[this.parent(i)])) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    extractMax() {
        if (this.isEmpty()) return null;
        const max = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }
        return max;
    }

    heapifyDown(i) {
        let maxIndex = i;
        const left = this.leftChild(i);
        const right = this.rightChild(i);

        if (left < this.heap.length && this.compare(this.heap[left], this.heap[maxIndex])) {
            maxIndex = left;
        }
        if (right < this.heap.length && this.compare(this.heap[right], this.heap[maxIndex])) {
            maxIndex = right;
        }

        if (i !== maxIndex) {
            this.swap(i, maxIndex);
            this.heapifyDown(maxIndex);
        }
    }

    peek() {
        return this.isEmpty() ? null : this.heap[0];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    size() {
        return this.heap.length;
    }

    // Remove item by ID and rebuild heap
    removeById(id) {
        const index = this.heap.findIndex(item => item.id === id);
        if (index === -1) return false;
        
        // Swap with last element, pop, then heapify
        if (index === this.heap.length - 1) {
            this.heap.pop();
        } else {
            this.heap[index] = this.heap.pop();
            this.heapifyDown(index);
            this.heapifyUp(index);
        }
        return true;
    }

    getHeapArray() {
        return [...this.heap];
    }
}

// ==========================================
// 2. ROUTING GRAPH (Dijkstra's Algorithm)
// ==========================================
class RoutingGraph {
    constructor() {
        this.nodes = {}; // nodeName -> { type: 'hostel'|'hub'|'dept', x, y }
        this.adjacencyList = {}; // nodeName -> [ { node: neighbor, weight: w } ]
        this.initializeRoutingNetwork();
    }

    addNode(name, type, x, y) {
        this.nodes[name] = { type, x, y };
        this.adjacencyList[name] = [];
    }

    addEdge(u, v, weight) {
        this.adjacencyList[u].push({ node: v, weight });
        this.adjacencyList[v].push({ node: u, weight }); // Undirected graph for physical routing
    }

    initializeRoutingNetwork() {
        // Hostels (Bhawans) - Left Side (Spread out y-axis)
        this.addNode("Rajendra Bhawan", "hostel", 50, 50);
        this.addNode("Ravindra Bhawan", "hostel", 50, 150);
        this.addNode("Radhakrishnan Bhawan", "hostel", 50, 250);
        this.addNode("Sarojini Bhawan", "hostel", 50, 350);
        this.addNode("Kasturba Bhawan", "hostel", 50, 450);

        // Network/Routing Hubs - Center
        this.addNode("Main Switch Office", "hub", 220, 160);
        this.addNode("Central Distribution Hub", "hub", 220, 340);

        // Departments - Right Side
        this.addNode("IT Support Cell", "dept", 400, 70);
        this.addNode("Electrical Maintenance", "dept", 400, 190);
        this.addNode("Water Supply & Plumbing", "dept", 400, 310);
        this.addNode("Sanitation & Housekeeping", "dept", 400, 430);

        // Edges connecting Hostels to Hubs
        this.addEdge("Rajendra Bhawan", "Main Switch Office", 3);
        this.addEdge("Ravindra Bhawan", "Main Switch Office", 2);
        this.addEdge("Radhakrishnan Bhawan", "Main Switch Office", 4);
        this.addEdge("Radhakrishnan Bhawan", "Central Distribution Hub", 3);
        this.addEdge("Sarojini Bhawan", "Central Distribution Hub", 2);
        this.addEdge("Kasturba Bhawan", "Central Distribution Hub", 4);

        // Inter-hub link
        this.addEdge("Main Switch Office", "Central Distribution Hub", 5);

        // Hubs connecting to Departments
        this.addEdge("Main Switch Office", "IT Support Cell", 2);
        this.addEdge("Main Switch Office", "Electrical Maintenance", 3);
        
        this.addEdge("Central Distribution Hub", "Water Supply & Plumbing", 2);
        this.addEdge("Central Distribution Hub", "Sanitation & Housekeeping", 3);
        this.addEdge("Central Distribution Hub", "Electrical Maintenance", 4);
        this.addEdge("Main Switch Office", "Water Supply & Plumbing", 5);
    }

    findShortestPath(startNode, endNode) {
        if (!this.nodes[startNode] || !this.nodes[endNode]) return null;

        const distances = {};
        const previous = {};
        const queue = new Set();

        // Initialize
        for (let node in this.nodes) {
            distances[node] = Infinity;
            previous[node] = null;
            queue.add(node);
        }
        distances[startNode] = 0;

        while (queue.size > 0) {
            // Find node in queue with smallest distance
            let minNode = null;
            for (let node of queue) {
                if (minNode === null || distances[node] < distances[minNode]) {
                    minNode = node;
                }
            }

            if (distances[minNode] === Infinity) break;
            if (minNode === endNode) break;

            queue.delete(minNode);

            for (let neighbor of this.adjacencyList[minNode]) {
                const alt = distances[minNode] + neighbor.weight;
                if (alt < distances[neighbor.node]) {
                    distances[neighbor.node] = alt;
                    previous[neighbor.node] = minNode;
                }
            }
        }

        // Reconstruct path
        const path = [];
        let curr = endNode;
        while (curr !== null) {
            path.unshift(curr);
            curr = previous[curr];
        }

        return path[0] === startNode ? { path, cost: distances[endNode] } : null;
    }
}

// ==========================================
// 3. HASH MAP (Bucket Chaining for Complaints)
// ==========================================
class CustomHashMap {
    constructor(capacity = 10) {
        this.capacity = capacity;
        this.buckets = Array.from({ length: capacity }, () => []);
        this.size = 0;
    }

    // Simple hash function: sums ASCII values of keys modulo capacity
    hash(key) {
        let hashValue = 0;
        const keyStr = String(key);
        for (let i = 0; i < keyStr.length; i++) {
            hashValue = (hashValue * 31 + keyStr.charCodeAt(i)) % this.capacity;
        }
        return hashValue;
    }

    put(key, value) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        
        // Check if key already exists, overwrite if so
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i].key === key) {
                bucket[i].value = value;
                return;
            }
        }

        // Else push new node
        bucket.push({ key, value });
        this.size++;
    }

    get(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i].key === key) {
                return bucket[i].value;
            }
        }
        return null;
    }

    remove(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i].key === key) {
                bucket.splice(i, 1);
                this.size--;
                return true;
            }
        }
        return false;
    }

    getBuckets() {
        return this.buckets;
    }
}

// Export classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PriorityQueue, RoutingGraph, CustomHashMap };
}
