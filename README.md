# Financial Tracker Application

A full-stack application for tracking financial transactions with automatic month-end processing.

## Features

- Track daily financial transactions (credits and debits)
- Automatic month-end processing
- Transaction history with balance tracking
- Month-end history with closing balances
- Real-time balance updates
- Responsive web interface

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.2.5
- Spring Data JPA
- PostgreSQL
- Maven

### Frontend
- React
- Tailwind CSS
- Vite

## Getting Started

### Prerequisites
- Java 21 or higher
- Node.js 18 or higher
- PostgreSQL

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd financial-tracker
   ```
2. Configure PostgreSQL connection in `application.properties`
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd financial-tracker-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
financial-app/
├── financial-tracker/           # Backend Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/financialtracker/
│   │   │   │       ├── controller/    # REST controllers
│   │   │   │       ├── model/         # Entity classes
│   │   │   │       ├── repository/    # Data repositories
│   │   │   │       └── service/       # Business logic
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
└── financial-tracker-frontend/   # Frontend React application
    ├── src/
    │   ├── components/          # React components
    │   ├── App.jsx             # Main application component
    │   └── main.jsx            # Application entry point
    ├── package.json
    └── vite.config.js
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 