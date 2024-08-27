const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

app.use(bodyparser.json());

const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from your frontend
};
app.use(cors(corsOptions));


// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files from the /uploads directory
app.use('/uploads', express.static(uploadDir));



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

///////////////////////////////
require('./db');
require('./models/Reader');
require('./models/Reporter');
require('./models/AuthUser');
require('./models/Article');
require('./models/Draft');
//////////////////////////////


const authRoutes = require('./auth/authRoutes');
app.use(authRoutes);




// catch-all route for handling requests to invali routes
app.use((req, res, next) => {
    const error = new Error('Router not found');
    error.status = 404;
    next(error)
});


app.use(express.json());
app.use(cors());


//// Error handler
app.use(( error , req, res , next) => {
    req.status(error.status || 500).json({ error: error.message});
})

