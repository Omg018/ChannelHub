# ChannelHub

ChannelHub is a real-time messaging application designed to facilitate seamless communication through channels. Built with a modern tech stack, it offers features like user authentication, real-time message updates, and channel management.

## Features

- **Real-time Messaging**: Instant message delivery using Socket.io.
- **User Authentication**: Secure signup and login functionality with JWT and Bcrypt.
- **Channel Management**: Create and join channels to organize conversations.
- **Message Management**: Send and delete messages in real-time.
- **Responsive Design**: A user-friendly interface built with Next.js and Tailwind CSS.

## Tech Stack

### Server
- **Node.js**: JavaScript runtime environment.
- **Express**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing users, channels, and messages.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **Socket.io**: Library for real-time web applications.
- **JWT (JSON Web Tokens)**: For secure user authentication.

### Client
- **Next.js**: React framework for production.
- **React**: JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Socket.io-client**: Client-side library for Socket.io.
- **Axios**: Promise-based HTTP client for the browser.

## Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas connection)

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd ChannelHub
    ```

2.  **Install Server Dependencies:**

    Navigate to the server directory and install the required packages.

    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**

    Navigate to the client directory and install the required packages.

    ```bash
    cd ../client
    npm install
    ```

## Configuration

### Server Configuration

Create a `.env` file in the `server` directory and add the following environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

*   `PORT`: The port on which the server will run (default: 5000).
*   `MONGO_URI`: Your MongoDB connection string.
*   `JWT_SECRET`: A secret key for signing JSON Web Tokens.
*   `CLIENT_URL`: The URL of the client application (for CORS configuration).

## Running the Application

### Start the Server

In the `server` directory, run:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or your specified PORT).

### Start the Client

In the `client` directory, run:

```bash
npm run dev
```

The client application will start on `http://localhost:3000`.

## Project Structure

```
ChannelHub/
├── client/         # Frontend application (Next.js)
│   ├── public/     # Static assets
│   ├── src/        # Source code
│   └── ...
├── server/         # Backend application (Node.js/Express)
│   ├── config/     # Database configuration
│   ├── models/     # Mongoose models
│   ├── routes/     # API routes
│   └── ...
└── README.md       # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
