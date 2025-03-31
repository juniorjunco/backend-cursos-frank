import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js"; // Se importa sin llaves
import jwt from "jsonwebtoken";

const router = express.Router();

// Ruta segura para descargar un curso comprado
router.get("/download/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Obtener el token JWT

    if (!token) {
      return res.status(401).json({ error: "No autorizado. Token requerido." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!Array.isArray(user.purchasedCourses) || !user.purchasedCourses.includes(req.params.id)) {
      return res.status(403).json({ error: "No has comprado este curso" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    res.redirect(course.videoUrl); // Redirige al video solo si el usuario lo compró
  } catch (error) {
    console.error("Error en descarga de curso:", error);
    return res.status(401).json({ error: "Token inválido o sesión expirada" });
  }
});

export default router;
