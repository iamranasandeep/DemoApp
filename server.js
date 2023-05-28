const express = require("express")
const app = express()
const PORT = 1200
app.get('/', (req, res) => {
  res.send('Hello World from nursesbnb api!');
});

app.listen(PORT, () => {
  console.log(`app is listening to PORT ${PORT}`)
})



