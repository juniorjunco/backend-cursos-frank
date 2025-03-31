import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Función para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post("/checkout", async (req, res) => {
  try {
    console.log("📩 Recibiendo solicitud en /checkout:", req.body);

    const { userId, courseId, name_billing, email_billing, mobilephone_billing, type_doc_billing, number_doc_billing } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(courseId)) {
      console.log("❌ ID inválido:", { userId, courseId });
      return res.status(400).json({ error: "ID de usuario o curso no válido" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.log("❌ Curso no encontrado");
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    if (!course.price) {
      console.log("❌ El curso no tiene un precio definido");
      return res.status(400).json({ error: "El curso no tiene un precio válido" });
    }

    const paymentData = {
      key: process.env.EPAYCO_PUBLIC_KEY,
      amount: course.price.toFixed(2),
      tax: "0.00",
      tax_base: course.price.toFixed(2),
      currency: "COP",
      name: "Compra de curso",
      invoice: `ORDER-${Date.now()}`,
      name_billing,
      email_billing,
      mobilephone_billing,
      type_doc_billing,
      number_doc_billing,
      response: process.env.PAYCO_RESPONSE_URL,
      confirmation: process.env.PAYCO_CONFIRMATION_URL,
      test: process.env.EPAYCO_TEST_MODE === "true",
      src: process.env.EPAYCO_CHECKOUT_URL,
      external: "false",
    };

    console.log("✅ Datos de pago generados:", paymentData);
    res.json(paymentData);
  } catch (error) {
    console.error("❌ Error en /checkout:", error);
    res.status(500).json({ error: "Error procesando el pago", details: error.message });
  }
});


// **Ruta para confirmar el pago**
router.post("/confirm", async (req, res) => {
  try {
    console.log("📩 Recibiendo solicitud en /confirm:", req.body);

    const { userId, courseId, transactionStatus } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(courseId)) {
      console.log("❌ ID inválido:", { userId, courseId });
      return res.status(400).json({ error: "ID de usuario o curso no válido" });
    }

    console.log("📌 Estado de la transacción:", transactionStatus);

    if (transactionStatus !== "Aceptada") {
      console.log("⚠️ Pago no aceptado");
      return res.status(400).json({ error: "Pago no completado" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ Usuario no encontrado");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.log("❌ Curso no encontrado");
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    if (user.purchasedCourses.includes(courseId)) {
      console.log("⚠️ El usuario ya compró este curso");
      return res.status(400).json({ error: "El curso ya ha sido comprado" });
    }

    await User.findByIdAndUpdate(userId, { $addToSet: { purchasedCourses: courseId } });

    console.log("✅ Curso asignado al usuario correctamente");
    res.json({ message: "Curso comprado con éxito" });
  } catch (error) {
    console.error("❌ Error en /confirm:", error);
    res.status(500).json({ error: "Error asignando curso", details: error.message });
  }
});

export default router;
