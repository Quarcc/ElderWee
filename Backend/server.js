const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:3000",  //specify domains that can call your API
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

let port = 8000;

app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});