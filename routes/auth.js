import express from "express";
import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/firebase-login", async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verifica el token de Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Asigna un nombre predeterminado si no existe
    const userName = name || email.split("@")[0];

    // Busca o crea un usuario en MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name: userName, profilePic: picture });
    }

    // Genera un JWT propio
    const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, userId: user._id }); // Devuelve userId en la respuesta
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(401).json({ message: "Token inválido" });
  }
});

export default router;
