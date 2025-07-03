# Testing the Recent Donors Section

This directory contains scripts to help test the functionality of the application.

## Seed Donors Script

The `seedDonors.js` script allows you to quickly populate your database with fake donor data to test the Recent Donors Section of the application.

### Prerequisites

- Make sure MongoDB is running
- Ensure your backend server is properly configured with the MongoDB connection string

### How to Use

1. Open a terminal in the project root directory
2. Run the seed script:

```bash
node backend/scripts/seedDonors.js
```

3. Start your backend server (if not already running):

```bash
cd backend
npm start
```

4. Start your frontend application (if not already running):

```bash
npm run dev
```

5. Navigate to the homepage and scroll to the Recent Donors section to see the fake donor data displayed in the scrolling animation.

### What the Script Does

- Clears any existing donors in the database
- Inserts 8 fake donors with various:
  - Names (both individual and corporate donors)
  - Donation amounts
  - Payment methods
  - Timestamps (ranging from minutes to days ago)

### Customizing the Data

You can modify the `fakeDonors` array in `seedDonors.js` to add more donors or change the existing ones to test different scenarios.

## Troubleshooting

If you don't see the donors in the UI:

1. Check the browser console for any errors
2. Verify that your backend server is running
3. Confirm that the API endpoint is correctly configured in the frontend
4. Make sure all donors have `paymentStatus` set to "completed" (the UI only shows completed donations)
