import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import paymentRoutes from "./routes/payments.js";
import crearCursoRoutes from "./api/cursos/crear.js"; 
import epaycoWebhook from "./routes/epaycoWebhook.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MongoDB con manejo de errores
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => {
    console.error("❌ Error en la conexión", err);
    process.exit(1);
  });

// Confirmación de carga de rutas
console.log("✅ Rutas importadas correctamente: auth, courses, payments, cursos/crear");

// Definición de rutas
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cursos", crearCursoRoutes); 
app.use("/", epaycoWebhook);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
