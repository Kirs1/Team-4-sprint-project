# Spark! Bytes – Team 4 Sprint Project

A web application for reducing food waste on BU’s campus by notifying students and staff when there is leftover food from dining halls or events. Created by students for students!

## Project Overview

**Spark! Bytes** allows event organizers or dining staff to quickly create a “leftover food” event and notify BU community members.  
Users can view upcoming events, see details (location, time), and decide whether to go pick up the food.

## Features

- **User-facing**
  - View a list of upcoming leftover food events
  - See event details (location, time, food description)
  - User account dashboard (view past / upcoming events you joined or created)
  - Register for an event

- **Admin-facing**
  - Admin login
  - Create / edit / delete events

- **Technical**
  - RESTful API built with FastAPI
  - Frontend built with Next.js + React + Ant Design
  - Supabase (PostgreSQL) as the database
 
## Tech Stack
- **Frontend:** Next.js, React, Ant Design
- **Backend:** FastAPI (Python 3.12), Pydantic
- **Database:** Supabase (PostgreSQL)
- **Other:** Uvicorn, dotenv, Docker(If use)

# Getting Started
## 1.Prerequisites

Before running this project locally, make sure you have:

- **Python** 3.10 or higher
- **Node.js** 18 or higher (with npm)
- **Git** (to clone the repository)
- **Access to the team’s Supabase project** (Supabase URL + anon key)
- **Access to Mailgun API key and Sandbox domain**
- **Access to Google client for authentication**

## 2. Clone the Repository

```bash
git clone <REPO_URL>
cd Team-4-sprint-project
```

## 3. Backend Setup
```bash
#Setting up your backend
cd backend

#Creating the Virtual Enviornment:
python3 -m venv .venv

#Activating the virtual Enviornment
#For Mac/Linux:
source venv/bin/activate

#For Windows:
venv\Scripts\activate
```
## 4. Installing Dependencies 
```bash
#4 Installing Dependencies 
pip install -r requirements.txt

#Run the backend server
uvicorn main:app --reload --port 8000
```
Backend will be available at: http://127.0.0.1:8000


## 5. Frontend Setup
```bash
#In a seperate terminal
cd spark-bytes

# Install dependencies
npm install
# or
yarn install
```


## Setting up Environment Variables

First create a .env.local file in the frontend by doing:
```bash
cd spark-bytes
touch .env.local
```

After add the google auth client:
```bash
AUTH_SECRET=your_auth_secret_here
GOOGLE_CLIENT=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

And add the Mailgun:
```bash
API_KEY_MAILGUN=your_mailgun_api_key_here
SANDBOX_DOMAIN=your_sandbox_domain_here
```


Run the frontend dev server
```
npm run dev
or
yarn dev

```
Frontend will be available at: http://localhost:3000

Make sure your backend is running on port 8000 so the frontend can call the API.
The reason why we choose to do google auth only is to only 


## Frontend Testing

We use **Jest** and **React Testing Library** to test the frontend.

### How to run the tests

From the `spark-bytes` directory:

```bash
npm install
npm test
```

### Backend Testing 

From the root directory
```bash
pytest --cov
```
This runs all test files under src/__tests__/.


  
