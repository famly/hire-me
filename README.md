# Nursery Attendance App

## Overview

A nursery attendance management application built with Vite.js, React.js, and TypeScript. It allows staff to:
- List children with pagination.
- Check in a child.
- Check out a child.

## Setup Instructions

### Prerequisites
- Node.js (version 14.x or higher)
- npm (version 6.x or higher) or yarn

### Installation
1. Clone the repository and navigate into it:
   ```sh
   git clone https://github.com/your-username/nursery-attendance-app.git
   cd nursery-attendance-app

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

Checkin child API call throws an error sometimes 

```
curl \
  -d 'accessToken=<accessToken>&pickupTime=16:00' \
  https://app.famly.co/api/v2/children/fcd683d0-bc31-468c-948f-1ca70b91439d/checkins
```


