import Note from  "../models/NoteModel.js";
import User from  "../models/UserModel.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//halo
//get all (done)
export const getNotes = async (req,res) => {
    try {
        const response = await Note.findAll({
            attributes:['id','title','owner']
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
}

//get by name (done)
export const getNoteByName = async (req, res) => {
    try {
        const response = await Note.findAll({
            where: {
                owner: { [Op.like]: `%${req.params.owner}%` }
            },
            attributes: ['id', 'title', 'owner']
        });
        if (response.length === 0) {
            return res.status(404).json({ pesan: "Note tidak ditemukan" });
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
};

//get 1 note (done)
export const getNote = async (req, res) => {
    try {
        const response = await Note.findOne({
            where:{
                id: req.params.id
            }
        })

        if (!response) {
            return res.status(404).json({ pesan: "Note tidak ditemukan" });
        };

        // res.status(200).json({ pesan: "Note ditemukan" , note: response});
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
}

//create note (done)
export const createNote = async (req,res) => {
    try {
        await Note.create(req.body);
        res.status(201).json({pesan: "Note ditambahkan"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
}

//delete note (done)
export const deleteNote = async (req, res) => {
    try { 
        const response = await Note.destroy({
            where:{
                id: req.params.id
            }
        })
        if (!response) {
            return res.status(404).json({ pesan: "Note tidak ditemukan" });
        }
        res.status(200).json({ pesan: "Note telah dihapus" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
}


// Update a note
export const updateNote = async (req, res) => {
    try {
        await Note.update(req.body,{
            where:{
                id: req.params.id
            }
        });

        // if (!response) {
        //     return res.status(404).json({ pesan: "Note tidak ditemukan" });
        // }

        res.status(200).json({ pesan: "Note berhasil diupdate"});

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
}

//========================================================================================================
async function updateUser(req, res) {
  try{
    const { name, email, gender, password} = req.body;
    let updatedData = {
      name, email, gender
    }; //nyimpen jadi object

    if (password) {
        const encryptPassword = await bcrypt.hash(password, 8);
        updatedData.password = encryptPassword;
    }

    const result = await User.update(updatedData, {
        where: {
            id: req.params.id
        }
    });

    // Periksa apakah ada baris yang terpengaruh (diupdate)
    if (result[0] === 0) {
        return res.status(404).json({
            status: 'failed',
            message: 'User tidak ditemukan atau tidak ada data yang berubah',
            updatedData: updatedData,
            result
        });
    }


    
    res.status(200).json({msg:"User Updated"});
  } catch(error){
    console.log(error.message);
  }
}

// REGISTER //baru nambahin pasword dan bcrypt
async function createUser(req, res) {
  try{
    const { name, email, gender, password } = req.body;
    const encryptPassword = await bcrypt.hash(password, 8);
    await User.create({
        name: name,
        email: email,
        gender: gender,
        password: encryptPassword
        
    });
    res.status(201).json({msg:"Register Berhasil"});
} catch(error){
    console.log(error.message);
}
}

//Nambah fungsi buat login handler
async function loginHandler(req, res){
  try{
      const{email, password} = req.body;
      const user = await User.findOne({
          where : {
              email: email
          }
      });

      if(user){
        //Data User itu nanti bakalan dipake buat ngesign token kan
        // data user dari sequelize itu harus diubah dulu ke bentuk object
        //Safeuserdata dipake biar lebih dinamis, jadi dia masukin semua data user kecuali data-data sensitifnya  karena bisa didecode kayak password caranya gini :
        const userPlain = user.toJSON(); // Konversi ke object
        const { password: _, refresh_token: __, ...safeUserData } = userPlain;


          const decryptPassword = await bcrypt.compare(password, user.password);
          if(decryptPassword){
              const accessToken = jwt.sign(safeUserData, process.env.ACCESS_TOKEN_SECRET, {
                  expiresIn : '30d' 
              });
              const refreshToken = jwt.sign(safeUserData, process.env.REFRESH_TOKEN_SECRET, {
                  expiresIn : '1d' 
              });
              await User.update({refresh_token:refreshToken},{
                  where:{
                      id:user.id
                  }
              });
              res.cookie('refreshToken', refreshToken,{
                  httpOnly : false, //ngatur cross-site scripting, untuk penggunaan asli aktifkan karena bisa nyegah serangan fetch data dari website "document.cookies"
                  sameSite : 'none',  //ini ngatur domain yg request misal kalo strict cuman bisa akseske link dari dan menuju domain yg sama, lax itu bisa dari domain lain tapi cuman bisa get
                  maxAge  : 24*60*60*1000,
                  secure:true //ini ngirim cookies cuman bisa dari https, kenapa? nyegah skema MITM di jaringan publik, tapi pas development di false in aja
              });
              res.status(200).json({
                  status: "Succes",
                  message: "Login Berhasil",
                  safeUserData,
                  accessToken 
              });
          }
          else{
              res.status(400).json({
                  status: "Failed",
                  message: "Paassword atau email salah",
                
              });
          }
      } else{
          res.status(400).json({
              status: "Failed",
              message: "Paassword atau email salah",
          });
      }
  } catch(error){
      res.status(error.statusCode || 500).json({
          status: "error",
          message: error.message
      })
  }
}

// //nambah logout
// async function logout(req, res) {
//     try {
//         const refreshToken = req.cookies.refreshToken; // Check for refresh token in cookies
//         if (!refreshToken) return res.sendStatus(204); // No content, nothing to do

//         const user = await User.findOne({
//             where: {
//                 refresh_token: refreshToken
//             }
//         });

//         if (!user) return res.sendStatus(204); // No user found, nothing to do

//         // Invalidate the refresh token
//         await User.update({ refresh_token: null }, {
//             where: {
//                 id: user.id
//             }
//         });

//         // Clear the refresh token cookie
//         res.clearCookie('refreshToken', {
//             httpOnly: true,
//             secure: true,
//             sameSite: 'none'
//         });

//         return res.status(200).json({ message: "Logout successful" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }

async function logout(req, res) {
    try {
        const userId = req.params.id; // Get user ID from the request parameters
        const user = await User.findOne({
            where: {
                id: userId
            }
        });

        if (!user || !user.refresh_token) {
            return res.status(204).json({ message: "No user or refresh token found" }); // No content
        }

        // Invalidate the refresh token
        await User.update({ refresh_token: null }, {
            where: {
                id: userId
            }
        });

        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getUsers = async (req,res) => {
  try {
    const response = await User.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

export {updateUser, createUser, loginHandler, logout };