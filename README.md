#  Interactive Wall Calendar Component

A highly interactive, responsive React-based calendar component that mimics a real-world wall calendar. This project demonstrates strong frontend engineering skills including UI/UX design, state management, and performance optimization.

 **Live Demo:** https://calendar-front-black.vercel.app/
 **Loom Walkthrough:** [Insert Loom Video Link Here]  
 **GitHub Repo:** https://github.com/RachitSrivas/calendar_front 

---

## Features

###  Core Features
-  Wall Calendar UI – Clean and aesthetic layout inspired by physical calendars  
-  Fully Responsive – Works across mobile, tablet, and desktop  
-  Date Selection – Click to select individual dates  
-  Range Selection – Select multiple dates easily  

###  Advanced / Creative Features
-  Drag & Drop Range Selection  
  - Smooth click-and-drag interaction  
  - Handles reverse selection (end → start)  
-  Persistent State  
  - Saves selected dates, notes, and theme using localStorage  
-  Dynamic Theme Switcher  
  - Instantly switch UI themes  
  - Uses CSS variables for efficient styling  
-  Integrated Notes Section  
  - Add notes linked to your session  

---

##  Tech Stack

- **Frontend:** React (with Vite)  
- **Styling:** Tailwind CSS  
- **Date Handling:** date-fns  
- **Icons:** lucide-react  
- **State Management:** React Hooks  

---

##  Architectural Decisions

###  Date Handling
Used `date-fns` instead of native JavaScript Date APIs because:
- Modular and lightweight  
- Handles edge cases like leap years  
- Improves code readability and reliability  

---

###  State Management
- Managed state using React Hooks  
- Implemented drag-and-drop using:
  - onMouseDown  
  - onMouseEnter  
  - global onMouseUp  

This avoids using heavy external libraries while maintaining smooth performance.

---

###  Data Persistence
- Used localStorage to store:
  - Selected dates  
  - Notes  
  - Theme preferences  

Ensures user data is retained after page refresh.

---

###  Responsive UI Design
- Built with Tailwind CSS (mobile-first approach)  
- Layout:
  - flex-col (mobile)
  - flex-row (desktop)  
- Calendar grid:
  - grid grid-cols-7 for perfect alignment  

---


## Running Locally

### 1. Clone the repository

git clone [Insert Your Repo URL]


### 2. Navigate to project folder

cd calendar


### 3. Install dependencies

npm install


### 4. Run development server

npm run dev


---

##  Learning Outcomes

- Built complex UI with clean component architecture  
- Implemented drag-and-drop logic without external libraries  
- Improved understanding of state synchronization  
- Practiced real-world frontend problem solving  

---

##  Future Improvements

- Add backend for cloud sync  
- Implement authentication system  
- Add event reminders  
- Auto theme detection (dark/light mode)  

---

## Author

**Rachit Srivastava**  
 CSE, IIIT Manipur  

 GitHub: https://github.com/RachitSrivas  
 LinkedIn: https://www.linkedin.com/in/rachit-srivastava-40128a2a9/

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub and feel free to fork it!