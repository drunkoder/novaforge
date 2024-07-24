# Nova Forge

## Description

Nova Forge aims to develop a comprehensive buy and sell platform to facilitate the trade of mining resources within the space mining industry. This platform will include an Admin Console for managing resources and settings, a Stellar Marketplace for users to explore mining areas, make purchases, and sell items.
This project consists of a back-end server and two front-end applications: one for the marketplace and another for admin management. It provides functionalities for users and administrators to interact with the system.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js installed
- Git installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/drunkoder/novaforge.git
   ```

### Running the Back-End Server

1. Find ```mongod.cfg``` in ```C:\Program Files\MongoDB\Server\{version}``` and look for ```replication```. Update as administrator with the following details:
  ```bash
   replication:
     replSetName: rs0
   ```
2. Execute the following in mongosh:
   ```bash
   rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }]})
   ```
3. Update the `.env` file located in the `backend` directory according to your configuration.
4. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
5. Install dependencies:
   ```bash
   npm install
   ```
6. Navigate to the migrations directory:
   ```bash
   cd src/migrations
   ```

7. Run the database initialization script:
   ```bash
   node init_db.js
   ```

8. Return to the `backend` directory:
   ```bash
   cd ../..
   ```

10. Start the server:
   ```bash
   npm start
   ```

### Running the Front-End (Marketplace)

1. Navigate to the `marketplace` directory:
   ```bash
   cd frontend/marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open your web browser and visit [http://localhost:3002](http://localhost:3002).
4. Log in using the credentials: 
   - Email: user@example.org
   - Password: user@123

### Running the Front-End (Admin)

1. Navigate to the `admin` directory:
   ```bash
   cd frontend/admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open your web browser and visit [http://localhost:3001](http://localhost:3001).
4. Log in using the credentials: 
   - Email: admin@example.org
   - Password: admin@123
