# User Management System

A simple user management system built with Node.js, Express, and SQLite. This application demonstrates basic CRUD operations (Create, Read, Update, Delete) for managing user information.

![Application Screenshot](/screenshots/app.png)

## Features

- Add new users with their personal information
- View all users in a tabular format
- Edit existing user details
- Delete users from the system
- Data persistence using SQLite database
- Responsive design with Bootstrap

## Technology Stack

### Backend
- Node.js
- Express.js
- SQLite (better-sqlite3)
- CORS middleware

### Frontend
- EJS templating engine
- Bootstrap 5
- Axios for HTTP requests
- Font Awesome icons

## Project Structure

```
project/
├── backend/
│   ├── node_modules/
│   ├── backend.js
│   ├── database.sqlite
│   └── package.json
├── frontend/
│   ├── node_modules/
│   ├── public/
│   │   └── views/
│   │       ├── layout/
│   │       ├── add_users.ejs
│   │       ├── edit_users.ejs
│   │       └── index.ejs
│   ├── frontend.js
│   └── package.json
└── README.md
```

## Installation & Setup

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Start the backend server (from backend directory)
```bash
npm start
```

5. Start the frontend server (from frontend directory)
```bash
npm start
```

6. Access the application at http://localhost:5500

## API Endpoints

- GET `/users` - Retrieve all users
- GET `/users/:id` - Retrieve a specific user
- POST `/add` - Add a new user
- PUT `/update/:id` - Update an existing user
- DELETE `/delete/:id` - Delete a user

## Database Schema

### Users Table
- id (Primary Key)
- name
- gender
- email_id (Foreign Key)
- phone_id (Foreign Key)
- created (Timestamp)

### Contacts Table
- id (Primary Key)
- phone
- zipcode

### Emails Table
- id (Primary Key)
- email

## Contributing

This is a basic project for learning purposes. Feel free to fork and enhance it for your own learning.

## Note

This is a basic fullstack project developed as part of Advanced Computer Programming course study material. It demonstrates fundamental concepts of fullstack development including database management, API integration, and frontend user interface design.

## License

This project is open source and available under the [MIT License](LICENSE).