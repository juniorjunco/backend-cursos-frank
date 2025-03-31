import express from "express";

const router = express.Router();

// Ruta para recibir la confirmación de pagos de ePayco
router.post("/api/epayco/confirmation", (req, res) => {
    try {
        const paymentData = req.body;
        console.log("🔔 Confirmación de pago recibida:", paymentData);

        // Aquí puedes procesar la información del pago y actualizar tu base de datos si es necesario
        
        res.status(200).json({ message: "Confirmación recibida correctamente" });
    } catch (error) {
        console.error("❌ Error procesando la confirmación de ePayco:", error);
        res.status(500).json({ message: "Error procesando la confirmación" });
    }
});

export default router;
