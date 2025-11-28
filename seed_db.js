const mongoose = require('mongoose');

// MUST MATCH THE URI IN server.js
const MONGO_URI = "mongodb://localhost:27017/secret_scanner_db"; 

const ProductSchema = new mongoose.Schema({
    productName: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true }
});

const Product = mongoose.model('Product', ProductSchema);

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB...');

        // Create a test user
        const testUser = new Product({
            productName: "MyApp",
            apiKey: "12345-abcde-secret-key"
        });

        await testUser.save();
        console.log('✅ Test user created!');
        console.log('Product Name: MyApp');
        console.log('API Key:      12345-abcde-secret-key');

    } catch (error) {
        if (error.code === 11000) {
            console.log('⚠️  User already exists.');
        } else {
            console.error('Error:', error);
        }
    } finally {
        mongoose.disconnect();
    }
}

seed();