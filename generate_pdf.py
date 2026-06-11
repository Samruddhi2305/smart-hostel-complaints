import os
import sys

# Ensure fpdf2 is installed
try:
    from fpdf import FPDF
except ImportError:
    print("fpdf2 is not installed. Installing it now...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2"])
    from fpdf import FPDF

class PresentationPDF(FPDF):
    def __init__(self):
        # Landscape A4 size: 297mm width x 210mm height
        super().__init__(orientation="landscape", unit="mm", format="A4")
        self.set_margins(20, 15, 20)
        self.set_auto_page_break(False)

    def draw_background(self):
        # Draw dark background (RGB: 12, 10, 21)
        self.set_fill_color(12, 10, 21)
        self.rect(0, 0, 297, 210, "F")
        
        # Draw subtle border (RGB: 138, 43, 226 - Purple)
        self.set_draw_color(138, 43, 226)
        self.set_line_width(1)
        self.rect(5, 5, 287, 200, "D")

    def slide_header(self, title):
        # Header text
        self.set_xy(15, 12)
        self.set_font("Helvetica", "B", 24)
        self.set_text_color(0, 245, 212) # Cyan
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        
        # Small subtitle logo
        self.set_xy(240, 14)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(156, 163, 175)
        self.cell(40, 5, "SmartHostel Portal", align="R", new_x="LMARGIN", new_y="NEXT")

        # Header underline (medium gray line)
        self.set_draw_color(100, 100, 100)
        self.set_line_width(0.5)
        self.line(15, 25, 282, 25)

    def slide_footer(self, page_num):
        self.set_xy(15, 195)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(107, 114, 128) # Muted gray
        self.cell(100, 5, "IIT Roorkee Open Projects 2026")
        
        self.set_xy(240, 195)
        self.cell(40, 5, f"{page_num}", align="R")

    def add_title_slide(self):
        self.add_page()
        self.draw_background()
        
        # Giant title
        self.set_xy(20, 50)
        self.set_font("Helvetica", "B", 42)
        self.set_text_color(255, 255, 255)
        self.cell(0, 18, "Smart Hostel Complaint Management System", align="C", new_x="LMARGIN", new_y="NEXT")
        
        # Subtitle
        self.set_font("Helvetica", "", 18)
        self.set_text_color(0, 245, 212) # Cyan
        self.cell(0, 15, "IIT Roorkee Hostel Council Digital Infrastructure", align="C", new_x="LMARGIN", new_y="NEXT")
        
        # Presenter credentials block in bottom-left
        self.set_xy(18, 135)
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(156, 163, 175)
        
        self.write(5.5, "Presenter Details:\n")
        self.set_x(18)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(255, 255, 255)
        self.write(5.5, "Name: Diwase Samruddhi Sunil\n")
        self.set_x(18)
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(156, 163, 175)
        self.write(5.5, "Enrollment: 24119013\n")
        self.set_x(18)
        self.write(5.5, "Branch: P&I '28\n")
        self.set_x(18)
        self.write(5.5, "Email ID: diwase_ss@me.iitr.ac.in\n")
        self.set_x(18)
        self.write(5.5, "Contact: 8605843937")
        
        # Right info block: Domain & Tech
        self.set_xy(155, 135)
        self.write(5.5, "Problem Domain:\n")
        self.set_x(155)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(255, 255, 255)
        self.write(5.5, "Hostel Administration & Student Services\n\n")
        self.set_x(155)
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(156, 163, 175)
        self.write(5.5, "Key Technologies:\n")
        self.set_x(155)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(0, 245, 212)
        self.write(5.5, "HTML / CSS / JavaScript\n")
        self.set_x(155)
        self.write(5.5, "Data Structures & Algorithms\n")
        self.set_x(155)
        self.write(5.5, "Dashboard Analytics")
        
        # IITR Logo on the bottom-right
        logo_path = os.path.join(os.path.dirname(__file__), "iitr_logo.png")
        if os.path.exists(logo_path):
            self.image(logo_path, x=242, y=95, w=38, h=38)
            
        self.slide_footer(1)

    def add_problem_slide(self, page_num):
        self.add_page()
        self.draw_background()
        self.slide_header("Slide 2: Problem Understanding")
        
        # Left Column: Existing Challenges
        self.set_xy(18, 38)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(0, 245, 212)
        self.cell(125, 8, "Existing Challenges", new_x="LMARGIN", new_y="NEXT")
        
        self.set_x(18)
        self.set_font("Helvetica", "", 11.5)
        self.set_text_color(156, 163, 175)
        self.write(6.5, "Hostel residents frequently face issues related to:\n")
        
        challenges = ["Wi-Fi outages", "Electrical failures", "Plumbing problems", "Cleanliness concerns", "Infrastructure maintenance"]
        self.set_font("Helvetica", "B", 11.5)
        for c in challenges:
            self.set_x(24)
            self.set_text_color(255, 0, 84)
            self.write(6.5, "X  ")
            self.set_text_color(255, 255, 255)
            self.write(6.5, c + "\n")
            
        self.set_x(18)
        self.set_font("Helvetica", "", 11.5)
        self.set_text_color(156, 163, 175)
        self.write(6.5, "\nCurrently, complaints are managed through informal channels such as WhatsApp groups, phone calls, and manual registers.")

        # Right Column: Problems & Objective
        self.set_xy(150, 38)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(255, 0, 84)
        self.cell(125, 8, "Problems with Existing System", new_x="LMARGIN", new_y="NEXT")
        
        problems = [
            "Complaints get lost or forgotten",
            "No prioritization mechanism (FIFO bottlenecks)",
            "Slow response times & lack of transparency",
            "No performance analytics or history tracking"
        ]
        self.set_font("Helvetica", "", 11)
        for p in problems:
            self.set_x(150)
            self.set_text_color(255, 0, 84)
            self.write(6, "-  ")
            self.set_text_color(156, 163, 175)
            self.write(6, p + "\n")
            
        # Objective Box
        self.set_xy(148, 98)
        self.set_fill_color(22, 19, 41)
        self.set_draw_color(255, 0, 84)
        self.set_line_width(0.5)
        self.rect(148, 98, 132, 45, "DF")
        
        self.set_xy(153, 103)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(255, 255, 255)
        self.cell(120, 6, "OBJECTIVE", new_x="LMARGIN", new_y="NEXT")
        self.set_xy(153, 111)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(156, 163, 175)
        self.multi_cell(122, 5.5, "Develop a centralized digital complaint management platform that intelligently routes, prioritizes, tracks, and analyzes hostel complaints.")

        self.slide_footer(page_num)

    def add_solution_slide(self, page_num):
        self.add_page()
        self.draw_background()
        self.slide_header("Slide 3: Proposed Solution")
        
        self.set_xy(18, 38)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, "Smart Hostel Complaint Management System", new_x="LMARGIN", new_y="NEXT")
        
        boxes = [
            {
                "title": "Student Portal",
                "desc": "Students can easily register complaints, track status in real-time, view their complaint history, and receive active updates from council members."
            },
            {
                "title": "Council Dashboard",
                "desc": "Council members can view all incoming complaints in priority order, dispatch tickets, update lifecycle states, and monitor workloads across hostels."
            },
            {
                "title": "DSA Sandbox",
                "desc": "An educational playground demonstrating how binary heaps, graphs, and hash maps function behind the scenes to optimize real-world operations."
            }
        ]
        
        box_width = 82
        box_height = 100
        start_x = 20
        y_pos = 58
        
        for i, box in enumerate(boxes):
            x_pos = start_x + (i * 88)
            
            # Draw box card
            self.set_fill_color(22, 19, 41)
            self.set_draw_color(138, 43, 226)
            self.set_line_width(0.5)
            self.rect(x_pos, y_pos, box_width, box_height, "DF")
            
            # Icon index
            self.set_xy(x_pos + 6, y_pos + 8)
            self.set_font("Helvetica", "B", 15)
            self.set_text_color(0, 245, 212)
            self.cell(box_width - 12, 6, f"0{i+1}. {box['title']}", new_x="LMARGIN", new_y="NEXT")
            
            # Desc
            self.set_xy(x_pos + 6, y_pos + 22)
            self.set_font("Helvetica", "", 10.5)
            self.set_text_color(156, 163, 175)
            self.multi_cell(box_width - 12, 5.5, box['desc'])
            
        self.slide_footer(page_num)

    def draw_arrow(self, x1, y1, x2, y2):
        self.set_draw_color(0, 245, 212)
        self.set_line_width(0.5)
        self.line(x1, y1, x2, y2)
        
        # Draw small arrowhead pointing down
        if x1 == x2 and y2 > y1:
            self.line(x2, y2, x2 - 2, y2 - 2)
            self.line(x2, y2, x2 + 2, y2 - 2)

    def draw_chart_box(self, title, x, y, w, h):
        self.set_fill_color(22, 19, 41)
        self.set_draw_color(138, 43, 226)
        self.rect(x, y, w, h, "DF")
        self.set_xy(x + 2, y + (h/2) - 3)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(255, 255, 255)
        self.cell(w - 4, 6, title, align="C")

    def add_architecture_slide(self, page_num):
        self.add_page()
        self.draw_background()
        self.slide_header("Slide 4: System Architecture")
        
        # Left side: Flowchart rendering
        self.draw_chart_box("Student", 40, 38, 45, 10)
        self.draw_arrow(62.5, 48, 62.5, 54)
        
        self.draw_chart_box("Complaint Registration", 27.5, 54, 70, 10)
        self.draw_arrow(62.5, 64, 62.5, 70)
        
        self.draw_chart_box("Complaint Processing Engine", 22.5, 70, 80, 10)
        
        # Branching arrows
        self.set_draw_color(0, 245, 212)
        self.line(62.5, 80, 37.5, 88)
        self.line(37.5, 88, 37.5, 90)
        # arrowhead left
        self.line(37.5, 90, 35.5, 88)
        self.line(37.5, 90, 39.5, 88)
        
        self.line(62.5, 80, 87.5, 88)
        self.line(87.5, 88, 87.5, 90)
        # arrowhead right
        self.line(87.5, 90, 85.5, 88)
        self.line(87.5, 90, 89.5, 88)
        
        self.draw_chart_box("Hash Map (Storage)", 15, 90, 45, 10)
        self.draw_chart_box("Priority Queue (Scheduling)", 65, 90, 50, 10)
        
        self.draw_arrow(90, 100, 90, 108)
        self.draw_chart_box("Routing Graph", 65, 108, 50, 10)
        
        self.draw_arrow(90, 118, 90, 126)
        self.draw_chart_box("Concerned Department", 65, 126, 50, 10)
        
        self.draw_arrow(90, 136, 90, 144)
        self.draw_chart_box("Resolution", 65, 144, 50, 10)
        
        # Right side: Core Workflow list
        self.set_xy(138, 38)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(0, 245, 212)
        self.cell(100, 8, "Core Workflow Steps", new_x="LMARGIN", new_y="NEXT")
        
        steps = [
            "Student submits complaint with description details.",
            "Processing Engine performs simulated NLP classification.",
            "Priority score (1-4) is assigned automatically.",
            "Complaint is added to the Max-Heap Priority Queue.",
            "Dijkstra's routing graph determines shortest path to dept.",
            "Council processes complaint and chats with student.",
            "Status updates and notifications are synced to user dashboard."
        ]
        
        self.set_font("Helvetica", "", 10.5)
        for idx, step in enumerate(steps):
            self.set_x(138)
            self.set_text_color(112, 224, 0)
            self.write(6.2, f"{idx+1}.  ")
            self.set_text_color(156, 163, 175)
            self.write(6.2, step + "\n")
            
        self.slide_footer(page_num)

    def add_dsa_slide(self, page_num):
        self.add_page()
        self.draw_background()
        self.slide_header("Slide 5: DSA Implementation Details")
        
        # Table of DSA Details
        self.set_xy(20, 38)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(0, 245, 212)
        self.set_fill_color(22, 19, 41)
        
        self.cell(60, 10, "Data Structure", border="B", fill=True)
        self.cell(105, 10, "Implementation Details & Purpose", border="B", fill=True)
        self.cell(92, 10, "Complexities & Benefits", border="B", fill=True, new_x="LMARGIN", new_y="NEXT")
        
        # Rows data
        table_data = [
            (
                "Priority Queue\n(Max Heap)", 
                "Prioritizes complaints based on severity.\n- Urgent Plumbing -> Priority 4\n- Wi-Fi Outage -> Priority 3\n- Fan Repair -> Priority 2\n- General Feedback -> Priority 1", 
                "Complexities:\n- Insertion: O(log n)\n- Deletion: O(log n)\n- Peek: O(1)\nBenefits: Fast complaint scheduling."
            ),
            (
                "Hash Map\n(Chaining)", 
                "Instant complaint lookup mapping unique ticket IDs to objects.\n- COMP-2301 -> Details\n- COMP-2302 -> Details", 
                "Complexities:\n- Search: O(1)\n- Insert: O(1)\nBenefits: Fast retrieval, efficient status tracking."
            ),
            (
                "Graph +\nDijkstra Routing", 
                "Routes complaints to correct departments.\n- Path: Hostel -> Central Switch -> IT Department", 
                "Complexities:\n- Dijkstra: O(E log V)\nBenefits: Shortest path traversal, future scalability."
            )
        ]
        
        y_pos = 48
        for ds, impl, complexity in table_data:
            self.set_xy(20, y_pos)
            self.set_font("Helvetica", "B", 10.5)
            self.set_text_color(255, 255, 255)
            self.multi_cell(60, 5.5, ds, border="B")
            
            self.set_xy(80, y_pos)
            self.set_font("Helvetica", "", 10)
            self.set_text_color(156, 163, 175)
            self.multi_cell(105, 5.5, impl, border="B")
            
            self.set_xy(185, y_pos)
            self.multi_cell(92, 5.5, complexity, border="B")
            
            y_pos += 38
            
        self.slide_footer(page_num)

    def add_features_slide_v2(self, page_num):
        self.add_page()
        self.draw_background()
        self.slide_header("Slide 6: User Interface & Features")
        
        boxes = [
            {
                "title": "Student Portal",
                "features": ["Student registration form", "AI auto-categorization", "Complaint submission log", "Personal tracking dashboard"]
            },
            {
                "title": "Council Dashboard",
                "features": ["Active priority queue dispatch", "Priority manual adjustments", "Complaint status management", "Hostel workload overview"]
            },
            {
                "title": "Analytics Dashboard",
                "features": ["Total / pending / resolved counts", "Hostel caseload distribution", "Category workload graphs", "Resolution rate statistics"]
            }
        ]
        
        box_width = 82
        box_height = 110
        start_x = 20
        y_pos = 45
        
        for i, box in enumerate(boxes):
            x_pos = start_x + (i * 88)
            
            # Draw box card
            self.set_fill_color(22, 19, 41)
            self.set_draw_color(138, 43, 226)
            self.set_line_width(0.5)
            self.rect(x_pos, y_pos, box_width, box_height, "DF")
            
            # Title
            self.set_xy(x_pos + 6, y_pos + 8)
            self.set_font("Helvetica", "B", 14)
            self.set_text_color(0, 245, 212)
            self.cell(box_width - 12, 6, box['title'], new_x="LMARGIN", new_y="NEXT")
            
            # List items
            self.set_xy(x_pos + 6, y_pos + 20)
            self.set_font("Helvetica", "", 10.5)
            self.set_text_color(156, 163, 175)
            
            for item in box['features']:
                self.set_x(x_pos + 6)
                self.set_text_color(0, 245, 212)
                self.write(6.5, "-  ")
                self.set_text_color(156, 163, 175)
                self.write(6.5, item + "\n")
                
        self.slide_footer(page_num)

    def add_results_slide(self, page_num):
        self.add_page()
        self.draw_background()
        self.slide_header("Slide 7: Results & Expected Impact")
        
        self.set_xy(18, 38)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, "Expected Benefits Across Users", new_x="LMARGIN", new_y="NEXT")
        
        impacts = [
            {
                "title": "For Students",
                "bullets": ["Faster complaint resolution times", "Operational transparency on stages", "Real-time chat threads & tracking"]
            },
            {
                "title": "For Hostel Council",
                "bullets": ["Better physical resource allocation", "Reduced backlog via urgency queues", "Data-driven dispatch decision making"]
            },
            {
                "title": "For Administration",
                "bullets": ["Real-time performance metrics", "Proactive infrastructure monitoring", "Historical complaint trend insights"]
            }
        ]
        
        box_width = 82
        box_height = 110
        start_x = 20
        y_pos = 50
        
        for i, box in enumerate(impacts):
            x_pos = start_x + (i * 88)
            
            # Draw box card
            self.set_fill_color(22, 19, 41)
            self.set_draw_color(138, 43, 226)
            self.set_line_width(0.5)
            self.rect(x_pos, y_pos, box_width, box_height, "DF")
            
            # Title
            self.set_xy(x_pos + 6, y_pos + 8)
            self.set_font("Helvetica", "B", 14)
            self.set_text_color(112, 224, 0)
            self.cell(box_width - 12, 6, box['title'], new_x="LMARGIN", new_y="NEXT")
            
            # List items
            self.set_xy(x_pos + 6, y_pos + 20)
            self.set_font("Helvetica", "", 10.5)
            self.set_text_color(156, 163, 175)
            
            for item in box['bullets']:
                self.set_x(x_pos + 6)
                self.set_text_color(112, 224, 0)
                self.write(6.5, "->  ")
                self.set_text_color(156, 163, 175)
                self.write(6.5, item + "\n")
                
        self.slide_footer(page_num)

    def add_future_slide(self, page_num):
        self.add_page()
        self.draw_background()
        self.slide_header("Slide 8: Future Scope & Conclusion")
        
        # Left side: Future Scope
        self.set_xy(18, 38)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(0, 245, 212)
        self.cell(125, 8, "Future Enhancements", new_x="LMARGIN", new_y="NEXT")
        
        scope_items = [
            "AI-Based Classification: Automatically identify and route Wi-Fi, electrical, and plumbing issues using NLP.",
            "Mobile App: Native Android & iOS support for on-the-go notifications and photo attachments.",
            "Alert Notifications: Auto-trigger email notifications, SMS alerts, and in-app status updates.",
            "Predictive Maintenance: Run analysis on historical reports to identify recurring grid problems before failures occur."
        ]
        
        self.set_font("Helvetica", "", 10.5)
        for item in scope_items:
            self.set_x(18)
            self.set_text_color(0, 245, 212)
            self.write(7, "->  ")
            
            title_part, desc_part = item.split(":", 1)
            self.set_text_color(255, 255, 255)
            self.write(7, title_part + ":")
            self.set_text_color(156, 163, 175)
            self.write(7, desc_part + "\n\n")
            
        # Right side: Conclusion Box
        self.set_xy(148, 38)
        self.set_fill_color(22, 19, 41)
        self.set_draw_color(0, 245, 212) # Cyan border
        self.set_line_width(0.5)
        self.rect(148, 38, 132, 140, "DF")
        
        self.set_xy(153, 44)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(255, 255, 255)
        self.cell(120, 6, "CONCLUSION", new_x="LMARGIN", new_y="NEXT")
        
        self.set_xy(153, 54)
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(156, 163, 175)
        
        conclusion_text = (
            "The Smart Hostel Complaint Management System transforms traditional hostel complaint handling into a data-driven, transparent, and efficient workflow.\n\n"
            "By integrating Priority Queues, Hash Maps, and Graph Algorithms into real-world operations, the system not only improves complaint resolution but also demonstrates the practical application of Data Structures and Algorithms in solving campus-scale administrative challenges."
        )
        self.multi_cell(122, 5.8, conclusion_text)

        self.slide_footer(page_num)

def build_pdf():
    pdf = PresentationPDF()
    
    # Generate 8 slides with the exact user text contents
    pdf.add_title_slide()
    pdf.add_problem_slide(2)
    pdf.add_solution_slide(3)
    pdf.add_architecture_slide(4)
    pdf.add_dsa_slide(5)
    pdf.add_features_slide_v2(6)
    pdf.add_results_slide(7)
    pdf.add_future_slide(8)
    
    # Save PDF
    output_path = os.path.join(os.path.dirname(__file__), "presentation.pdf")
    pdf.output(output_path)
    print(f"Presentation PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    build_pdf()
