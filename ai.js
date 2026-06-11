// ai.js - Smart Hostel Complaint Classifier (Simulated NLP Keyword Engine)

const AIClassifier = {
    categories: {
        "IT / Wi-Fi": {
            keywords: ["wifi", "wi-fi", "internet", "router", "ethernet", "connection", "speed", "offline", "login", "portal", "lan", "cable", "network", "ping", "bandwidth"],
            dept: "IT Support Cell",
            icon: "fa-wifi"
        },
        "Electricity": {
            keywords: ["light", "fan", "switch", "plug", "socket", "power", "electricity", "electric", "current", "shock", "fuse", "blackout", "ac", "air conditioner", "charger", "bulb", "tubelight", "short circuit", "voltage"],
            dept: "Electrical Maintenance",
            icon: "fa-bolt"
        },
        "Plumbing": {
            keywords: ["leak", "water", "tap", "pipe", "clogged", "flush", "toilet", "washbasin", "bathroom", "shower", "drain", "sink", "overflow", "geyser", "drip"],
            dept: "Water Supply & Plumbing",
            icon: "fa-tint"
        },
        "Cleanliness": {
            keywords: ["dirty", "dust", "garbage", "trash", "clean", "sweeping", "broom", "smell", "odor", "waste", "litter", "mess", "hygiene", "mosquito", "insect", "cockroach", "dustbin"],
            dept: "Sanitation & Housekeeping",
            icon: "fa-broom"
        }
    },

    priorityKeywords: {
        4: ["shock", "spark", "fire", "smoke", "burst", "flooding", "overflowing", "emergency", "blackout", "exams tomorrow", "injury", "danger", "hazard"], // Urgent
        3: ["broken", "not working", "unable", "exam", "study", "smelly", "leaking", "constantly", "classroom", "urgent", "important", "failed"],       // High
        2: ["slow", "blinking", "loose", "dirty", "smell", "clogged", "mosquitoes", "litter", "noise"],                                               // Medium
        1: ["clean", "dusty", "replace", "adjustment", "request", "routine"]                                                                          // Low
    },

    classify: function(text) {
        const lowerText = text.toLowerCase();
        let scores = {
            "IT / Wi-Fi": 0,
            "Electricity": 0,
            "Plumbing": 0,
            "Cleanliness": 0
        };

        // 1. Classify Category
        let totalMatches = 0;
        for (const [category, config] of Object.entries(this.categories)) {
            config.keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'gi');
                const matches = lowerText.match(regex);
                if (matches) {
                    scores[category] += matches.length;
                    totalMatches += matches.length;
                }
            });
        }

        // Find category with highest score
        let bestCategory = "IT / Wi-Fi"; // Default fallback
        let maxScore = 0;
        for (const [category, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestCategory = category;
            }
        }

        // Calculate confidence
        const confidence = totalMatches > 0 ? Math.round((maxScore / totalMatches) * 100) : 50;

        // 2. Classify Priority
        let priorityCode = 1; // Default: Low
        let maxPriorityMatch = 0;

        // Check each priority level
        for (let level = 4; level >= 1; level--) {
            const keywords = this.priorityKeywords[level];
            let levelMatches = 0;
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'gi');
                const matches = lowerText.match(regex);
                if (matches) {
                    levelMatches += matches.length;
                }
            });

            if (levelMatches > 0 && level > priorityCode) {
                priorityCode = level;
                maxPriorityMatch = levelMatches;
            }
        }

        // Fallback checks for context (e.g. leaking water is high/urgent, fire is urgent)
        if (bestCategory === "Plumbing" && lowerText.includes("leak") && priorityCode < 3) {
            priorityCode = 3; // Leaking plumbing is high
        }
        if (bestCategory === "Electricity" && (lowerText.includes("shock") || lowerText.includes("spark")) && priorityCode < 4) {
            priorityCode = 4; // Electrical shock/spark is urgent
        }

        const priorityMap = {
            1: "Low",
            2: "Medium",
            3: "High",
            4: "Urgent"
        };

        return {
            category: bestCategory,
            department: this.categories[bestCategory].dept,
            icon: this.categories[bestCategory].icon,
            priority: priorityMap[priorityCode],
            priorityCode: priorityCode,
            confidence: confidence === 0 ? 60 : confidence
        };
    }
};

// Export for usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIClassifier;
}
