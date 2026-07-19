✅ Ledger — To-Do Web Application

🌟A modern, glassmorphic to-do list built with vanilla HTML, CSS, and JavaScript.
Built for **SkillCraft Technology** Web Development Internship — **Task 04**.
 
🔷Features

- **Add tasks** with an optional due date and time
- **Mark complete** with an animated checkbox and strike-through
- **Edit in place** via a modal — update title, date, or time
- **Delete** individual tasks, or **clear all completed** in one click
- **Filter tabs** — All / Active / Completed
- **Overdue detection** — past-due, unfinished tasks are flagged in red automatically
- **Smart sorting** — active tasks surface by nearest due date; undated tasks and completed tasks settle to the bottom
- **Live stats** — total, active, and completed counts, plus an animated completion-percentage ring
- **Glassmorphic UI** — frosted card, gradient headings, ambient background glow, toast confirmations
- **Fully responsive & accessible** — scales to mobile, keyboard-operable, `prefers-reduced-motion` respected

🔷Tech Stack

| Layer | Choice |
|---|---|
| Structure | Semantic HTML5 |
| Styling | Plain CSS (custom properties, backdrop-filter, no framework) |
| Logic | Vanilla JavaScript (ES6, no libraries) |
| Fonts | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (headings) + [Inter](https://fonts.google.com/specimen/Inter) (UI) |

📈 Project Structure

```
todo-web-app/
├── index.html      
└── README.md
```

 🔷 Design Notes

Tasks are held in memory for the session (no `localStorage`), so the list resets on page reload by design — this keeps the app dependency-free and safe to preview anywhere, including sandboxed viewers. Swapping in `localStorage`, IndexedDB, or a backend API would be a natural next step for persistence across sessions.

🌟 Acknowledgements

Task brief provided by **SkillCraft Technology**.


*Part of my SkillCraft Technology internship submissions — final task.*
