import express from "express";
import Course from "../../models/Course.js"; // Verifica que esta ruta es correcta

const router = express.Router();

router.post("/", async (req, res) => { // <- La ruta debe ser "/"
  try {
    const { title, duration, price, description, images, userId } = req.body;

    if (!title || !duration || !price || !description || !userId) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const nuevoCurso = new Course({
      title,
      duration,
      price,
      description,
      images,
      userId,
    });

    await nuevoCurso.save();
    res.status(201).json({ courseId: nuevoCurso._id, message: "Curso creado exitosamente" });
  } catch (error) {
    console.error("Error al crear curso:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
