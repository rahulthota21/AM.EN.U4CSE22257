## 📁 Folder Structure

```
AM.EN.U4CSE22257/
├── backend/     # Backend code for stock price APIs
└── frontend/    # React frontend for stock chart and heatmap
```

---

## 🧠 What’s Inside

### ✅ Backend
- Built with: Express / FastAPI (based on your implementation)
- Exposes the following APIs:
  - `/stocks/:ticker?minutes=m&aggregation=average`
  - `/stockcorrelation?minutes=m&ticker=XXX&ticker=YYY`
- Returns average prices and correlation data using your registered token

### ✅ Frontend
- Built using: React + TypeScript + Material UI
- Pages:
  - Stock Viewer (line chart + average)
  - Correlation Heatmap (grid view with color scale)
- All data is fetched **only from your own backend**

---

## 📸 Screenshots
You can find example output screenshots here:

```
frontend/screenshots/
├── 2.1.png    # Stock Viewer page
└── 2.2.png    # Correlation Heatmap page
```

---

## 🚀 How to Run

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## ✅ Notes

- No test server APIs are called from the frontend.
- Only public libraries and local backend are used.
- Code is clean, functional, and follows a responsive layout.

## *Note:*
- the token is changing frequently [ notice this point]