// app.js - Application orchestration and DSA Visualizations

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. DATA INSTANCES & INITIAL SEED DATA
    // ==========================================
    const queue = new PriorityQueue();
    const routingGraph = new RoutingGraph();
    const hashMap = new CustomHashMap(10);
    
    let activeUser = null;
    let activeTicketId = null; // For modal chat
    let activeRoutePath = [];  // For Dijkstra highlight
    
    // Seed initial mock complaints if localStorage is empty
    if (!localStorage.getItem("smart_complaints")) {
        const seedComplaints = [
            {
                id: "COMP-2301",
                description: "Wi-Fi is completely down in Block C first floor since last night, can't access lecture portal.",
                category: "IT / Wi-Fi",
                priority: "High",
                priorityCode: 3,
                status: "In Progress",
                hostel: "Rajendra Bhawan",
                block: "C-Block",
                room: "104",
                studentName: "Devansh Gupta",
                studentEnrollment: "23114002",
                timestamp: Date.now() - 3600000 * 5 // 5 hours ago
            },
            {
                id: "COMP-2302",
                description: "Water is overflowing from the overhead tank and leaking into Room 204. Massive flooding danger!",
                category: "Plumbing",
                priority: "Urgent",
                priorityCode: 4,
                status: "Pending",
                hostel: "Sarojini Bhawan",
                block: "B-Block",
                room: "204",
                studentName: "Sneha Patel",
                studentEnrollment: "23115012",
                timestamp: Date.now() - 3600000 * 2 // 2 hours ago
            },
            {
                id: "COMP-2303",
                description: "Ceiling fan regulator is broken, rotating at maximum speed constantly.",
                category: "Electricity",
                priority: "Medium",
                priorityCode: 2,
                status: "Pending",
                hostel: "Radhakrishnan Bhawan",
                block: "A-Block",
                room: "312",
                studentName: "Rahul Sharma",
                studentEnrollment: "23113084",
                timestamp: Date.now() - 3600000 * 12 // 12 hours ago
            },
            {
                id: "COMP-2304",
                description: "Garbage collection dustbin outside the mess hall is overflowing and smells terrible.",
                category: "Cleanliness",
                priority: "Low",
                priorityCode: 1,
                status: "Resolved",
                hostel: "Ravindra Bhawan",
                block: "Mess Hub",
                room: "N/A",
                studentName: "Aditya Verma",
                studentEnrollment: "23112022",
                timestamp: Date.now() - 3600000 * 24 // 24 hours ago
            }
        ];
        
        const seedMessages = {
            "COMP-2301": [
                { sender: "student", text: "Please fix this, exams are starting next week.", time: Date.now() - 3600000 * 4 },
                { sender: "council", text: "We have informed the IT Support cell. A technician is investigating.", time: Date.now() - 3600000 * 3 }
            ],
            "COMP-2302": [
                { sender: "student", text: "Water is entering room lobby! Send plumber immediately.", time: Date.now() - 3600000 * 1.8 }
            ]
        };

        localStorage.setItem("smart_complaints", JSON.stringify(seedComplaints));
        localStorage.setItem("smart_messages", JSON.stringify(seedMessages));
    }

    // Load data from localStorage into memory
    function syncDataFromStorage() {
        const complaints = JSON.parse(localStorage.getItem("smart_complaints") || "[]");
        
        // Reset local structures
        queue.heap = [];
        for (let i = 0; i < hashMap.capacity; i++) {
            hashMap.buckets[i] = [];
        }
        hashMap.size = 0;
        
        // Populate Priority Queue (only non-resolved tickets for the active dispatcher queue)
        // and populate HashMap (all tickets for lookup)
        complaints.forEach(item => {
            hashMap.put(item.id, item);
            if (item.status !== "Resolved") {
                queue.insert(item);
            }
        });
        
        // Re-read profile
        activeUser = JSON.parse(localStorage.getItem("student_profile") || "null");
    }

    // Save complaints from HashMap/list back to storage
    function saveComplaintsToStorage(allComplaints) {
        localStorage.setItem("smart_complaints", JSON.stringify(allComplaints));
    }

    // Initialize data
    syncDataFromStorage();

    // ==========================================
    // 2. VIEW CONTROLLER (Tab Navigation)
    // ==========================================
    const tabs = document.querySelectorAll(".nav-tab");
    const panels = document.querySelectorAll(".tab-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));
            
            tab.classList.add("active");
            const targetPanel = document.getElementById(tab.dataset.tab);
            targetPanel.classList.add("active");
            
            // Trigger redraws if switching to specific tabs
            if (tab.dataset.tab === "council-view") {
                renderCouncilDashboard();
            } else if (tab.dataset.tab === "dsa-view") {
                renderDSASandbox();
            } else if (tab.dataset.tab === "student-view") {
                renderStudentDashboard();
            }
        });
    });

    // ==========================================
    // 3. STUDENT PORTAL LOGIC
    // ==========================================
    const registrationForm = document.getElementById("registration-form");
    const registrationCard = document.getElementById("registration-card");
    const complaintCard = document.getElementById("complaint-card");
    const profileCard = document.getElementById("profile-card");
    const ticketsCard = document.getElementById("tickets-card");
    const complaintForm = document.getElementById("complaint-form");
    const textarea = document.getElementById("complaint-text");
    const aiBox = document.getElementById("ai-suggestion-box");
    const logoutBtn = document.getElementById("logout-btn");

    function renderStudentDashboard() {
        if (activeUser) {
            // Logged in
            registrationCard.classList.add("hidden");
            complaintCard.classList.remove("hidden");
            profileCard.classList.remove("hidden");
            ticketsCard.classList.remove("hidden");
            
            // Update profile displays
            document.getElementById("profile-display-name").textContent = activeUser.name;
            document.getElementById("profile-display-id").textContent = `#${activeUser.enrollment}`;
            document.getElementById("profile-display-hostel").textContent = activeUser.hostel;
            document.getElementById("profile-display-room").textContent = `${activeUser.block}, Room ${activeUser.room}`;
            
            // Render active tickets for this student
            renderStudentTickets();
        } else {
            // Logged out
            registrationCard.classList.remove("hidden");
            complaintCard.classList.add("hidden");
            profileCard.classList.add("hidden");
            ticketsCard.classList.add("hidden");
        }
    }

    // Register User
    registrationForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const profile = {
            name: document.getElementById("student-name").value,
            enrollment: document.getElementById("enrollment-no").value,
            hostel: document.getElementById("student-hostel").value,
            block: document.getElementById("student-block").value,
            room: document.getElementById("student-room").value
        };
        localStorage.setItem("student_profile", JSON.stringify(profile));
        activeUser = profile;
        renderStudentDashboard();
    });

    // Logout User
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("student_profile");
        activeUser = null;
        renderStudentDashboard();
    });

    // Real-time AI classification listener
    textarea.addEventListener("input", () => {
        const text = textarea.value.trim();
        if (text.length > 8) {
            aiBox.classList.remove("hidden");
            const result = AIClassifier.classify(text);
            
            // Set category
            document.getElementById("ai-category").innerHTML = `<i class="fa-solid ${result.icon}"></i> ${result.category}`;
            
            // Set priority pill
            const priorityEl = document.getElementById("ai-priority");
            priorityEl.textContent = result.priority;
            priorityEl.className = "priority-pill"; // clear existing
            priorityEl.classList.add(`pill-${result.priority.toLowerCase()}`);
            
            // Set confidence progress
            document.getElementById("ai-confidence-bar").style.width = `${result.confidence}%`;
            document.getElementById("ai-confidence").textContent = `${result.confidence}%`;
        } else {
            aiBox.classList.add("hidden");
        }
    });

    // File Complaint
    complaintForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = textarea.value.trim();
        if (!text || !activeUser) return;
        
        const aiResult = AIClassifier.classify(text);
        const uniqueId = `COMP-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const newComplaint = {
            id: uniqueId,
            description: text,
            category: aiResult.category,
            priority: aiResult.priority,
            priorityCode: aiResult.priorityCode,
            status: "Pending",
            hostel: activeUser.hostel,
            block: activeUser.block,
            room: activeUser.room,
            studentName: activeUser.name,
            studentEnrollment: activeUser.enrollment,
            timestamp: Date.now()
        };
        
        // Save to state & storage
        const complaints = JSON.parse(localStorage.getItem("smart_complaints") || "[]");
        complaints.push(newComplaint);
        saveComplaintsToStorage(complaints);
        
        // Re-sync memory structures
        syncDataFromStorage();
        
        // UI Clean up
        textarea.value = "";
        aiBox.classList.add("hidden");
        
        // Update dashboard
        renderStudentDashboard();
        
        // Show routing alert
        alert(`Complaint successfully routed to ${aiResult.department} via ${uniqueId}! Check Council Board or DSA Sandbox to watch it resolve.`);
    });

    // Render student's active tickets list
    function renderStudentTickets() {
        const listContainer = document.getElementById("student-ticket-list");
        listContainer.innerHTML = "";
        
        const complaints = JSON.parse(localStorage.getItem("smart_complaints") || "[]");
        const studentTickets = complaints.filter(t => t.studentEnrollment === activeUser.enrollment);
        
        if (studentTickets.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No complaints registered yet.</p>';
            return;
        }

        // Sort: newest first
        studentTickets.sort((a,b) => b.timestamp - a.timestamp);
        
        studentTickets.forEach(t => {
            const item = document.createElement("div");
            item.className = "ticket-item";
            
            const priorityClass = `pill-${t.priority.toLowerCase()}`;
            const statusClass = `status-${t.status.replace(" ", "").toLowerCase()}`;
            
            item.innerHTML = `
                <div class="ticket-item-header">
                    <span class="ticket-item-id">${t.id}</span>
                    <span class="priority-pill ${priorityClass}">${t.priority}</span>
                </div>
                <p class="ticket-item-desc">${t.description}</p>
                <div class="ticket-item-footer">
                    <span class="status-badge ${statusClass}">${t.status}</span>
                    <button class="btn-chat-link" data-id="${t.id}">
                        <i class="fa-regular fa-comment-dots"></i> Chat with Council
                    </button>
                </div>
            `;
            
            // Add click to chat link
            item.querySelector(".btn-chat-link").addEventListener("click", () => {
                openModal(t.id, "student");
            });
            
            listContainer.appendChild(item);
        });
    }

    // Initialize student view first
    renderStudentDashboard();

    // ==========================================
    // 4. COUNCIL DASHBOARD LOGIC
    // ==========================================
    let hostelChart = null;
    let categoryChart = null;

    function renderCouncilDashboard() {
        syncDataFromStorage();
        
        // 1. Update stats count
        const complaints = JSON.parse(localStorage.getItem("smart_complaints") || "[]");
        document.getElementById("stat-total").textContent = complaints.length;
        document.getElementById("stat-urgent").textContent = complaints.filter(t => t.priority === "Urgent" && t.status !== "Resolved").length;
        document.getElementById("stat-pending").textContent = complaints.filter(t => t.status === "In Progress").length;
        document.getElementById("stat-resolved").textContent = complaints.filter(t => t.status === "Resolved").length;
        
        // Update tab notification badge
        const unreadCount = complaints.filter(t => t.status === "Pending").length;
        document.getElementById("unread-count").textContent = unreadCount;
        document.getElementById("unread-count").style.display = unreadCount > 0 ? "inline-flex" : "none";

        // 2. Render dispatch table in Priority Queue sorting
        // We will make a temp priority queue, extract all elements in max-heap order to get the correct prioritized array
        const tempQueue = new PriorityQueue();
        complaints.forEach(item => {
            if (item.status !== "Resolved") {
                tempQueue.insert(item);
            }
        });
        
        const tbody = document.getElementById("council-queue-tbody");
        tbody.innerHTML = "";

        if (tempQueue.isEmpty()) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-table">No active complaints in the dispatch queue.</td></tr>`;
        } else {
            while (!tempQueue.isEmpty()) {
                const t = tempQueue.extractMax();
                const tr = document.createElement("tr");
                
                const priorityClass = `pill-${t.priority.toLowerCase()}`;
                const statusClass = `status-${t.status.replace(" ", "").toLowerCase()}`;
                const catIcons = {
                    "IT / Wi-Fi": "fa-wifi text-cyan",
                    "Electricity": "fa-bolt text-orange",
                    "Plumbing": "fa-tint text-violet",
                    "Cleanliness": "fa-broom text-green"
                };
                const iconClass = catIcons[t.category] || "fa-clipboard";

                tr.innerHTML = `
                    <td><strong>${t.id}</strong></td>
                    <td class="ticket-cell-desc">${t.description.substring(0, 50)}${t.description.length > 50 ? '...' : ''} <span>By: ${t.studentName}</span></td>
                    <td class="ticket-cell-hostel"><strong>${t.hostel}</strong>Room ${t.room} (${t.block})</td>
                    <td><i class="fa-solid ${iconClass}"></i> ${t.category}</td>
                    <td><span class="priority-pill ${priorityClass}">${t.priority}</span></td>
                    <td><span class="status-badge ${statusClass}">${t.status}</span></td>
                    <td>
                        <button class="btn btn-outline btn-sm open-details-btn" data-id="${t.id}">
                            <i class="fa-solid fa-folder-open"></i> Manage
                        </button>
                    </td>
                `;
                
                tr.querySelector(".open-details-btn").addEventListener("click", () => {
                    openModal(t.id, "council");
                });
                
                tbody.appendChild(tr);
            }
        }

        // 3. Render Analytics Charts
        renderAnalyticsCharts(complaints);
    }

    function renderAnalyticsCharts(complaints) {
        // Prepare data for Hostel workloads
        const hostelCounts = {};
        const categoryCounts = {};
        
        // Preset keys
        const hostels = ["Rajendra Bhawan", "Ravindra Bhawan", "Radhakrishnan Bhawan", "Sarojini Bhawan", "Kasturba Bhawan"];
        hostels.forEach(h => hostelCounts[h] = 0);
        
        const categories = ["IT / Wi-Fi", "Electricity", "Plumbing", "Cleanliness"];
        categories.forEach(c => categoryCounts[c] = 0);

        complaints.forEach(t => {
            if (t.status !== "Resolved") {
                if (hostelCounts[t.hostel] !== undefined) hostelCounts[t.hostel]++;
                if (categoryCounts[t.category] !== undefined) categoryCounts[t.category]++;
            }
        });

        // Destroy old chart instances if they exist
        if (hostelChart) hostelChart.destroy();
        if (categoryChart) categoryChart.destroy();

        // 1. Hostel Workload Chart (Doughnut)
        const ctxHostel = document.getElementById("hostelWorkloadChart").getContext("2d");
        hostelChart = new Chart(ctxHostel, {
            type: 'doughnut',
            data: {
                labels: Object.keys(hostelCounts),
                datasets: [{
                    data: Object.values(hostelCounts),
                    backgroundColor: [
                        '#8a2be2', // violet
                        '#00f5d4', // cyan
                        '#ffb703', // orange
                        '#ff0054', // red
                        '#70e000'  // green
                    ],
                    borderWidth: 1,
                    borderColor: '#121020'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#f3f4f6', font: { family: 'Outfit', size: 11 } }
                    }
                }
            }
        });

        // 2. Category Workload Chart (Bar)
        const ctxCategory = document.getElementById("categoryWorkloadChart").getContext("2d");
        categoryChart = new Chart(ctxCategory, {
            type: 'bar',
            data: {
                labels: Object.keys(categoryCounts).map(c => c.split(" / ")[0]), // truncate Wi-Fi label
                datasets: [{
                    label: 'Active Tickets',
                    data: Object.values(categoryCounts),
                    backgroundColor: 'rgba(138, 43, 226, 0.4)',
                    borderColor: '#8a2be2',
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        ticks: { color: '#9ca3af', stepSize: 1 },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    x: {
                        ticks: { color: '#9ca3af', font: { family: 'Outfit' } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // ==========================================
    // 5. DSA PLAYGROUND / VISUALIZER CODE
    // ==========================================
    function renderDSASandbox() {
        syncDataFromStorage();
        
        // 1. Draw Heap Binary Tree
        drawHeapTree();
        
        // 2. Draw Dijkstra Routing Graph
        drawRoutingGraph();
        
        // 3. Draw HashMap buckets
        drawHashMapBuckets();
    }

    // A. Visualizes the Heap Array as a hierarchical tree
    function drawHeapTree() {
        const heapContainer = document.getElementById("heap-visualizer");
        heapContainer.innerHTML = "";
        
        const heapArray = queue.getHeapArray();
        
        if (heapArray.length === 0) {
            heapContainer.innerHTML = '<div class="empty-state">No complaints in the queue heap.</div>';
            return;
        }

        const treeRoot = document.createElement("div");
        treeRoot.className = "heap-node-tree";
        heapContainer.appendChild(treeRoot);

        // We will lay out the heap elements by levels:
        // Level 0: Index 0
        // Level 1: Index 1, 2
        // Level 2: Index 3, 4, 5, 6
        // Level 3: Index 7 to 14
        const maxIndex = Math.min(heapArray.length, 15); // Show first 15 nodes max (4 levels)
        let level = 0;
        let index = 0;

        while (index < maxIndex) {
            const levelSize = Math.pow(2, level);
            const levelEl = document.createElement("div");
            levelEl.className = "heap-level";
            
            for (let i = 0; i < levelSize; i++) {
                if (index >= maxIndex) break;
                
                const complaint = heapArray[index];
                const nodeCircle = document.createElement("div");
                nodeCircle.className = `heap-circle priority-${complaint.priorityCode}`;
                nodeCircle.title = `${complaint.id} | ${complaint.description}`;
                nodeCircle.setAttribute("data-id", complaint.id);
                
                nodeCircle.innerHTML = `
                    <span class="heap-circle-val">${complaint.id.split("-")[1]}</span>
                    <span class="heap-circle-index">P:${complaint.priorityCode} [${index}]</span>
                `;
                
                // Clicking heap node shows details/routes it in graph
                nodeCircle.addEventListener("click", () => {
                    const ticketId = nodeCircle.getAttribute("data-id");
                    // Trigger graph traversal visualization
                    triggerGraphTraversal(ticketId);
                });

                levelEl.appendChild(nodeCircle);
                index++;
            }
            treeRoot.appendChild(levelEl);
            level++;
        }
    }

    // B. Draw Routing Graph on Canvas
    function drawRoutingGraph() {
        const canvas = document.getElementById("graph-canvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const nodes = routingGraph.nodes;
        const adj = routingGraph.adjacencyList;

        // 1. Draw Edges
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 2;
        ctx.font = "10px Inter";

        const drawnEdges = new Set();
        for (let u in adj) {
            adj[u].forEach(neighbor => {
                const v = neighbor.node;
                const edgeKey = [u, v].sort().join("-");
                if (drawnEdges.has(edgeKey)) return;
                drawnEdges.add(edgeKey);

                const nodeU = nodes[u];
                const nodeV = nodes[v];

                // Check if this edge is part of the highlighted active shortest path
                let isHighlighted = false;
                if (activeRoutePath && activeRoutePath.length > 0) {
                    const indexU = activeRoutePath.indexOf(u);
                    const indexV = activeRoutePath.indexOf(v);
                    if (indexU !== -1 && indexV !== -1 && Math.abs(indexU - indexV) === 1) {
                        isHighlighted = true;
                    }
                }

                if (isHighlighted) {
                    ctx.strokeStyle = "var(--color-cyan)";
                    ctx.lineWidth = 4;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "var(--color-cyan)";
                } else {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
                    ctx.lineWidth = 1.5;
                    ctx.shadowBlur = 0;
                }

                ctx.beginPath();
                ctx.moveTo(nodeU.x, nodeU.y);
                ctx.lineTo(nodeV.x, nodeV.y);
                ctx.stroke();

                // Draw edge weight
                const midX = (nodeU.x + nodeV.x) / 2;
                const midY = (nodeU.y + nodeV.y) / 2;
                ctx.shadowBlur = 0;
                ctx.fillStyle = isHighlighted ? "var(--color-cyan)" : "var(--text-muted)";
                ctx.fillText(`w:${neighbor.weight}`, midX + 5, midY - 5);
            });
        }

        // Reset shadow
        ctx.shadowBlur = 0;

        // 2. Draw Nodes
        for (let name in nodes) {
            const node = nodes[name];
            
            // Check highlight
            const isHighlighted = activeRoutePath && activeRoutePath.includes(name);

            // Node colors
            let color = "rgba(255, 255, 255, 0.1)";
            let strokeColor = "rgba(255, 255, 255, 0.2)";
            if (node.type === "hostel") {
                color = "rgba(138, 43, 226, 0.15)";
                strokeColor = "var(--color-violet)";
            } else if (node.type === "dept") {
                color = "rgba(112, 224, 0, 0.15)";
                strokeColor = "var(--color-green)";
            } else if (node.type === "hub") {
                color = "rgba(255, 183, 3, 0.15)";
                strokeColor = "var(--color-orange)";
            }

            if (isHighlighted) {
                color = "rgba(0, 245, 212, 0.25)";
                strokeColor = "var(--color-cyan)";
                ctx.shadowBlur = 12;
                ctx.shadowColor = "var(--color-cyan)";
            } else {
                ctx.shadowBlur = 0;
            }

            // Draw outer node circle
            ctx.fillStyle = color;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Draw node inner dot
            ctx.fillStyle = isHighlighted ? "var(--color-cyan)" : strokeColor;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Label text styling
            ctx.shadowBlur = 0;
            ctx.fillStyle = isHighlighted ? "var(--color-cyan)" : "var(--text-primary)";
            ctx.font = isHighlighted ? "bold 9.5px Outfit" : "9px Outfit";
            
            // Draw text aligned offset
            if (node.type === "hostel") {
                ctx.textAlign = "right";
                ctx.fillText(name.split(" ")[0], node.x - 22, node.y + 3);
            } else if (node.type === "dept") {
                ctx.textAlign = "left";
                ctx.fillText(name, node.x + 22, node.y + 3);
            } else {
                ctx.textAlign = "center";
                ctx.fillText(name, node.x, node.y - 22);
            }
        }
    }

    // Trigger Dijkstra search and highlight path when clicking an active heap node
    function triggerGraphTraversal(ticketId) {
        const ticket = hashMap.get(ticketId);
        if (!ticket) return;

        const startHostel = ticket.hostel;
        const targetDept = ticket.category;
        
        // Find shortest routing path
        const result = routingGraph.findShortestPath(startHostel, targetDept);
        if (result) {
            activeRoutePath = result.path;
            
            // Redraw graph
            drawRoutingGraph();
            
            // Log routing path in browser alert console info
            console.log(`Routing ${ticketId} from ${startHostel} to ${targetDept} via: ${result.path.join(" -> ")} (Distance weight: ${result.cost})`);
        }
    }

    // C. Draw Hash Map buckets and chained items
    function drawHashMapBuckets() {
        const container = document.getElementById("hashmap-visualizer");
        container.innerHTML = "";

        const buckets = hashMap.getBuckets();
        
        buckets.forEach((bucket, index) => {
            const bucketRow = document.createElement("div");
            bucketRow.className = "hash-bucket";
            
            // Index box
            const indexBox = document.createElement("div");
            indexBox.className = "hash-bucket-index";
            indexBox.textContent = index;
            bucketRow.appendChild(indexBox);

            // Chain of nodes
            const chain = document.createElement("div");
            chain.className = "hash-chain";
            
            if (bucket.length === 0) {
                const nullText = document.createElement("span");
                nullText.className = "empty-state";
                nullText.style.padding = "0";
                nullText.textContent = "∅";
                chain.appendChild(nullText);
            } else {
                bucket.forEach((item, nodeIdx) => {
                    const node = document.createElement("div");
                    node.className = "hash-node";
                    node.title = `${item.value.studentName} | ${item.value.description}`;
                    node.innerHTML = `
                        <span class="key">${item.key}</span>
                        <span class="val">${item.value.category.split(" / ")[0]}</span>
                    `;
                    
                    // Clicking hashnode highlights it in graph Dijkstra and heap
                    node.addEventListener("click", () => {
                        triggerGraphTraversal(item.key);
                        
                        // Briefly pulse matching element in heap visualizer
                        const heapNode = document.querySelector(`.heap-circle[data-id="${item.key}"]`);
                        if (heapNode) {
                            heapNode.style.borderColor = "var(--color-cyan)";
                            heapNode.style.transform = "scale(1.2)";
                            setTimeout(() => {
                                heapNode.style.borderColor = "";
                                heapNode.style.transform = "";
                            }, 1000);
                        }
                    });

                    chain.appendChild(node);
                    
                    // Draw chain link pointer arrow if not the last item
                    if (nodeIdx < bucket.length - 1) {
                        const arrow = document.createElement("div");
                        arrow.className = "hash-arrow";
                        arrow.innerHTML = '<i class="fa-solid fa-arrow-right-long"></i>';
                        chain.appendChild(arrow);
                    }
                });
            }
            
            bucketRow.appendChild(chain);
            container.appendChild(bucketRow);
        });
    }

    // ==========================================
    // 6. CHAT & DETAILS MODAL ORCHESTRATION
    // ==========================================
    const modal = document.getElementById("chat-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const saveModalBtn = document.getElementById("save-modal-btn");
    const chatForm = document.getElementById("chat-input-form");
    const chatInput = document.getElementById("chat-message-text");
    const messagesContainer = document.getElementById("chat-messages-container");
    
    let activeRole = "student"; // Binds chat bubble side and header styling

    function openModal(ticketId, role) {
        syncDataFromStorage();
        
        const ticket = hashMap.get(ticketId);
        if (!ticket) return;

        activeTicketId = ticketId;
        activeRole = role;
        
        // Populate modal data fields
        document.getElementById("modal-ticket-id").textContent = ticket.id;
        document.getElementById("modal-ticket-title").textContent = ticket.description;
        
        document.getElementById("modal-student-name").textContent = ticket.studentName;
        document.getElementById("modal-student-enrollment").textContent = ticket.studentEnrollment;
        document.getElementById("modal-student-location").textContent = `${ticket.hostel}, Room ${ticket.room} (${ticket.block})`;
        
        document.getElementById("modal-ticket-category").textContent = ticket.category;
        document.getElementById("modal-ticket-priority").textContent = ticket.priority;
        
        // Select status/priority dropdowns
        document.getElementById("update-status-select").value = ticket.status;
        document.getElementById("update-priority-select").value = ticket.priority;
        
        // Load messages
        renderChatMessages();
        
        // Show modal overlay
        modal.classList.remove("hidden");
        chatInput.focus();

        // Run Dijkstra to show route instantly in background visualizer
        triggerGraphTraversal(ticketId);
    }

    function closeModal() {
        modal.classList.add("hidden");
        activeTicketId = null;
        
        // Refresh active views
        renderStudentDashboard();
        renderCouncilDashboard();
        renderDSASandbox();
    }

    closeModalBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Save ticket adjustments from council modal
    saveModalBtn.addEventListener("click", () => {
        if (!activeTicketId) return;

        const complaints = JSON.parse(localStorage.getItem("smart_complaints") || "[]");
        const ticketIndex = complaints.findIndex(t => t.id === activeTicketId);
        
        if (ticketIndex === -1) return;

        const newStatus = document.getElementById("update-status-select").value;
        const newPriority = document.getElementById("update-priority-select").value;
        
        const priorityCodeMap = { "Low": 1, "Medium": 2, "High": 3, "Urgent": 4 };
        
        complaints[ticketIndex].status = newStatus;
        complaints[ticketIndex].priority = newPriority;
        complaints[ticketIndex].priorityCode = priorityCodeMap[newPriority];
        
        saveComplaintsToStorage(complaints);
        
        alert(`Ticket ${activeTicketId} updated and re-routed successfully.`);
        closeModal();
    });

    // Submit new chat messages
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || !activeTicketId) return;
        
        const allMessages = JSON.parse(localStorage.getItem("smart_messages") || "{}");
        if (!allMessages[activeTicketId]) {
            allMessages[activeTicketId] = [];
        }
        
        const newMessage = {
            sender: activeRole, // Binds sender as student or council depending on active view origin
            text: text,
            time: Date.now()
        };
        
        allMessages[activeTicketId].push(newMessage);
        localStorage.setItem("smart_messages", JSON.stringify(allMessages));
        
        chatInput.value = "";
        renderChatMessages();
    });

    function renderChatMessages() {
        messagesContainer.innerHTML = "";
        const allMessages = JSON.parse(localStorage.getItem("smart_messages") || "{}");
        const thread = allMessages[activeTicketId] || [];
        
        if (thread.length === 0) {
            messagesContainer.innerHTML = '<p class="empty-state">No messages exchanged yet. Send a note to start the conversation.</p>';
            return;
        }

        thread.forEach(msg => {
            const bubble = document.createElement("div");
            const isStudent = msg.sender === "student";
            
            bubble.className = `chat-bubble ${isStudent ? 'chat-bubble-student' : 'chat-bubble-council'}`;
            
            const timeFormatted = new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const senderLabel = isStudent ? "Student" : "Hostel Council";

            bubble.innerHTML = `
                <div>${msg.text}</div>
                <span class="chat-meta">${senderLabel} • ${timeFormatted}</span>
            `;
            
            messagesContainer.appendChild(bubble);
        });

        // Scroll chat to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
