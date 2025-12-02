# Spark! Bytes – Team 4 Sprint Project

A web application for reducing food waste on BU’s campus by notifying students and staff when there is leftover food from dining halls or events.

## Project Overview

**Spark! Bytes** allows event organizers or dining staff to quickly create a “leftover food” event and notify BU community members.  
Users can view upcoming events, see details (location, time), and decide whether to go pick up the food.

## Features

- **User-facing**
  - View a list of upcoming leftover food events
  - See event details (location, time, food description)
  - User account dashboard (view past / upcoming events you joined or created)

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

## 1.Prerequisites

Before running this project locally, make sure you have:

- **Python** 3.10 or higher
- **Node.js** 18 or higher (with npm)
- **Git** (to clone the repository)
- **Access to the team’s Supabase project** (Supabase URL + anon key)

## 2. Clone the Repository

```bash
git clone <REPO_URL>
cd Team-4-sprint-project

```

Replace <REPO_URL> with actual GitHub repo URL.
For example, with SSH, you can type git clone git@github.com:Kirs1/Team-4-sprint-project.git

## 3. Backend Setup
```bash
cd backend

#Install dependencies
pip install -r requirements.txt

#Run the backend server
uvicorn backend.main:app --reload --port 8000

```
Backend will be available at: http://127.0.0.1:8000

## 4. Frontend Setup
```bash
cd ../spark-bytes

# Install dependencies
npm install
# or
# yarn install

# Run the frontend dev server
npm run dev
# or
# yarn dev

```
Frontend will be available at: http://localhost:3000

Make sure your backend is running on port 8000 so the frontend can call the API.


  
