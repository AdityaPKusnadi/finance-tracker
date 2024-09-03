# Finance Tracker

[![Website](https://img.shields.io/website?url=https%3A%2F%2Ffinancialtracker.nisgroup.online)](https://financialtracker.nisgroup.online)

Finance Tracker is a web-based application designed to help you efficiently manage your personal finances. The application is built using Next.js and Firebase, providing features to add, edit, and delete transactions, manage categories, and select the currency you want to use.

## Features

- **Add, Edit, and Delete Transactions**: Easily manage your financial transactions.
- **Custom Categories**: Add and manage transaction categories as per your needs.
- **Currency Selection**: Support for multiple currencies such as USD, JPY, and IDR.
- **Firebase Authentication**: Secure your data with Firebase login.

## Installation and Usage

### Prerequisites

Make sure you have the following tools installed before starting:

- Node.js (recommended version 14 or higher)
- NPM or Yarn
- Firebase account with Firestore and Authentication enabled

### How to Use

1. **Clone this repository:**

   ```bash
   git clone https://github.com/AdityaPKusnadi/finance-tracker.git
   cd finance-tracker
2. **Install dependencies:**
    ```bash
    npm install

3. **Configure Firebase:**
    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

4. **Local Development:**
To run the project in a development environment, use the following command
```bash
  npm run dev

