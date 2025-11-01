# Byteforce
## Firebase Firestore rules for Compete (1v1)

If you see permission-denied errors like:

- 403 Forbidden on `documents:batchGet`
- Firestore RPC BatchGetDocuments failed with `permission-denied`

Update your Firestore rules to allow authenticated users to read/write the `matches` and `queues` collections used by Compete:

1) Open Firebase Console → Firestore Database → Rules
2) Replace with the rules below and Publish

```
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /matches/{matchId} {
			allow read, write: if request.auth != null;
		}
		match /queues/{queueId} {
			allow read, write: if request.auth != null;
		}
	}
}
```

Alternatively, use the `firestore.rules` file in this repo and deploy via the Firebase CLI.

## Authorized domains for Firebase Auth

To resolve `auth/unauthorized-domain` when signing in from another device, add these to Firebase Authentication → Settings → Authorized domains:

- localhost
- 127.0.0.1
- Your LAN IP (e.g., 192.168.x.x) if testing across devices
- Any tunnel domain you use (e.g., your-subdomain.ngrok-free.app)
- Your production domain (e.g., app.yourdomain.com)

## Firestore networking in restricted networks

Some networks block streaming transports and cause 400 errors on Firestore Listen channels. This app configures Firestore to use long polling in `src/firebase.js`:

```
initializeFirestore(app, {
	experimentalForceLongPolling: true,
	useFetchStreams: false,
});
```

This improves reliability on corporate/restricted Wi‑Fi.
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
