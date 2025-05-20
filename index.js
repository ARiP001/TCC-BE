import express from "express";
import cors from "cors";
import NoteRoutes from "./routes/NoteRoutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


const app = express();
app.set("view engine", "ejs");

dotenv.config();

app.use(cookieParser());
app.use(cors({ credentials:true,origin:'https://tcc-notes-arif-dot-e-07-450704.uc.r.appspot.com/' }));
app.use(express.json());
app.get("/", (req, res) => res.render("index"));
app.use(NoteRoutes);

app.listen(7000, () => {
    console.log("Server running on port 7000 and accessible externally");
});
