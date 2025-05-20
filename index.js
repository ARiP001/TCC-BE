import express from "express";
import cors from "cors";
import NoteRoutes from "./routes/NoteRoutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


const app = express();
app.set("view engine", "ejs");

dotenv.config();

app.use(cookieParser());
app.use(cors({ 
    credentials:true,
    origin:['http://localhost:3000'] 
}));
app.use(express.json());
app.get("/", (req, res) => res.render("index"));
app.use(NoteRoutes);

app.listen(7000, () => {
    console.log("Server running on port 7000 and accessible externally");
});
