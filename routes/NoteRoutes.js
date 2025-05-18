import express from "express"
import { 
    getNotes, 
    createNote, 
    deleteNote, 
    getNote, 
    updateNote, 
    getNoteByName,
    createUser,
    loginHandler,
    logout,
    getUsers,
    updateUser

} from "../controller/NoteController.js"
import { refreshToken } from "../controller/RefreshToken.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

//endpoint akses token
router.get('/token', refreshToken);

//endpoin user
router.post('/login', loginHandler);
router.delete('/logout/:id', logout);
router.get("/users",verifyToken, getUsers);
router.patch("/users/:id", verifyToken, updateUser);

//endpoint notes
router.get('/notes', verifyToken, getNotes);
router.post('/notes', verifyToken, createNote);
router.delete('/notes/:id', verifyToken, deleteNote);
router.get('/notes/:id', verifyToken, getNote);
router.patch('/notes/:id', verifyToken, updateNote);
router.get('/notes/search/:owner', getNoteByName);
// Add endpoint for creating a user
router.post('/register', createUser);

export default router;