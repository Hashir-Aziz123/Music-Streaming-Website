const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is working!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
