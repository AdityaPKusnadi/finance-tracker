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

The application will run on http://localhost:3000.

5. **Build for Production:**
When you're ready to build the application for production, use:
    ```bash
    npm run build
6. **Deploy to cPanel:**
After the build is complete, upload the entire contents of the out/ folder to the public_html directory in cPanel.
Your application will be available at the domain associated with your cPanel account.

### Static Export Configuration
This project is configured to be exported as a static website using Next.js with the following settings in next.config.mjs:
    ```bash
    const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true, // Optional, if you are using images from an external domain
    },
    };
    export default nextConfig;

### Technologies Used
- Next.js - A React framework for web applications.
- Firebase - Used for authentication and Firestore database.
- Tailwind CSS - A utility-first CSS framework for styling.

## Contributions
Contributions are welcome! Please open an issue or pull request for any features or improvements you would like to add.

## License
This project is licensed under the MIT License. See the LICENSE file for more information.

## Live Demo
Check out the live demo of this project here: Finance Tracker

## Repository
GitHub repository link: Finance Tracker Repository
