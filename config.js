'use strict';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/blog-app-test';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://lightsage88:Walruses8@my-first-atlas-db-obkbt.mongodb.net/blogAppMongooseChallenge?retryWrites=true&w=majority';
exports.PORT = process.env.PORT || 8080;  