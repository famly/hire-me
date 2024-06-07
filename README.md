# Nursery Attendance App

## Overview

A nursery attendance management application built with Vite.js, React.js, and TypeScript. It allows staff to:
- List children with pagination.
- Check in a child.
- Check out a child.


## Design Decisions
### Project Structure
 The project is organized to separate concerns:

* /public: Static assets and index.html.
* /src: Source code, including:
   * /api: API-related functions.
   * /components: React components.
* App.tsx: Main application component.
* index.tsx: Entry point for the React application.

## Setup Instructions

### Prerequisites
- Node.js (version 14.x or higher)
- npm (version 6.x or higher) or yarn

### Installation
1. Clone the repository and navigate into it:
   ```sh
   git clone git@github.com:iziVersano/hire-me.git
   cd hire-me

2. Install dependencies:

```sh
 npm install
```
### Running the Application

### Start the development server:
```sh
npm run dev
```
Open http://localhost:3000 in your browser.


## Usage
List Children: The main page lists children with pagination controls.
Check In/Out: Use "Check In" and "Check Out" buttons for managing attendance.

## Note

Checkin child API call throws a 403 an unauthorized error sometimes 

```
curl \
  -d 'accessToken=<accessToken>&pickupTime=16:00' \
  https://app.famly.co/api/v2/children/fcd683d0-bc31-468c-948f-1ca70b91439d/checkins
```


