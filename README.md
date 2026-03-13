# OP-NATUR Sales & Inventory System

OP-NATUR is a React-based application designed to streamline the sales and inventory management of products for small businesses. The system provides a polished and professional workflow while ensuring stable data handling, tracking, and metric calculation.

## Main Features

- **Financial Dashboard**: View real-time financial metrics, including total sales, overall investment, active inventory value, and net profit.
- **Inventory Management**: Add and track products using automatic ID parsing (e.g., `PRD-0001`), duplicate detection, and merging capabilities. Warns securely when product stock gets low.
- **Sales Registration**: Process sales rapidly with a highly customized modal including autocomplete product search, live-updating financial breakdowns (cost vs profit), commission calculation tools for card payments, and stock validation protections.
- **Sales History**: A historical record of all transactions processed in the application.

## Technologies Used

- **React 19** with **Vite**
- **Tailwind CSS** for styling
- **Lucide React** for generic, crisp iconography
- **React Hot Toast** for success/error alerts
- **Recharts** for metric visualization
- **Framer Motion** for animations and transitions

## How to run locally

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd <project_folder_name>
   ```

2. **Install dependencies**:
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser to the local address provided by Vite (e.g., `http://localhost:5173`).

---

*This application is production-ready for review, providing robust stock checking, financial precision, and a smooth UI.*
