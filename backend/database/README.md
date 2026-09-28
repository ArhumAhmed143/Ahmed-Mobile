# MongoDB Database

The backend uses MongoDB Atlas through Mongoose. Collections and indexes are created from the schemas in `backend/src/models/index.js` when the application connects; no SQL import is needed.

Core collections are `categories`, `products`, `admins`, `orders`, `flashdeals`, and `auditlogs`. Order items and payment attempts are embedded in their order document. Product images are embedded in their product document.

Set `MONGODB_URI` in `backend/.env` using the Atlas driver connection string, then run `npm run seed` from the `backend` directory to add the starter catalog. Run `npm run create-admin` to create the admin login.