import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";

const router = express.Router();

// Ruta para recibir la confirmación de pagos de ePayco
router.post("/api/epayco/confirmation", async (req, res) => {
    try {
        const paymentData = req.body;
        console.log("🔔 Confirmación de pago recibida:", paymentData);

        // Verificar si el estado del pago es 'Aceptada'
        if (paymentData.x_response !== 'Aceptada') {
            return res.status(400).json({ message: "Pago no aceptado" });
        }

        // Procesar la información del pago (por ejemplo, asignar el curso al usuario)
        const user = await User.findById(paymentData.x_id_client);
        const course = await Course.findById(paymentData.x_extra1); // Asumiendo que 'x_extra1' es el ID del curso

        if (!user || !course) {
            return res.status(404).json({ message: "Usuario o curso no encontrados" });
        }

        // Agregar el curso al usuario
        user.purchasedCourses.push(course._id);
        await user.save();

        console.log("✅ Curso asignado correctamente al usuario");

        // Redirigir al frontend con la información del pago
        const paymentInfo = {
            reference: paymentData.x_id_invoice,
            response: paymentData.x_response,
            reason: paymentData.x_response_reason_text,
            courseTitle: course.title,
            receiptOfPayment: paymentData.x_transaction_id,
            total: `${paymentData.x_amount} ${paymentData.x_currency_code}`,
        };

        // Redirigir a la página PayResponse con los parámetros
        const redirectUrl = `/pay-response?reference=${paymentInfo.reference}&response=${paymentInfo.response}&reason=${paymentInfo.reason}&courseTitle=${paymentInfo.courseTitle}&receiptOfPayment=${paymentInfo.receiptOfPayment}&total=${paymentInfo.total}`;
        res.redirect(redirectUrl);

    } catch (error) {
        console.error("❌ Error procesando la confirmación de ePayco:", error);
        res.status(500).json({ message: "Error procesando la confirmación" });
    }
});

export default router;
