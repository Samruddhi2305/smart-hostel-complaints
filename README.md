# SmartHostel: Smart Hostel Complaint Management System

A centralized digital complaint management portal designed for hostel residents and council members at **IIT Roorkee**. This project automates, prioritizes, and visualizes the complaint handling workflow using fundamental Data Structures and Algorithms (DSA) and client-side NLP categorization.

## Key Features

* **Student Portal:** Session initialization with student details (Enrollment No., Bhawan, Room) and complaint submission with real-time AI category/severity estimation.
* **Council Board:** Operational dashboard featuring KPI counters, a Priority Queue dispatch table, workload analysis charts, and an interactive student-council chat modal.
* **DSA Sandbox:** Interactive playground visualizers showing:
  * **Binary Max-Heap:** Active dispatch scheduling sorting urgent complaints first.
  * **HashMap Buckets:** Collision resolution via linked list chaining for $O(1)$ lookups.
  * **Routing Graph:** Renders a canvas network and runs **Dijkstra's shortest path** to highlight travel paths from hostels to maintenance departments.

## Tech Stack & Architecture

* **Frontend:** Vanilla HTML5, Canvas API, and CSS3 custom properties (glowing dark-theme variables).
* **Analytics:** Chart.js via CDN.
* **Persistence:** Client-side `localStorage` data persistence (fully offline-capable).

## DSA Complexity & Usage

| Data Structure | Implementation Details | Complexity |
| :--- | :--- | :--- |
| **Priority Queue (Max-Heap)** | Priority sorted by urgency levels (1-4) & timestamp | Insertion/Deletion: $O(\log n)$ |
| **Hash Map** | 10-index bucket array using character chaining | Search/Insertion: $O(1)$ |
| **Routing Graph** | Dijkstra's algorithm for shortest-path routing | Dijkstra: $O(E \log V)$ |

## How to Run

1. Clone or download this repository.
2. Open **`index.html`** in any modern web browser (Google Chrome, Firefox, Microsoft Edge). No server setup or package installations required!

---
