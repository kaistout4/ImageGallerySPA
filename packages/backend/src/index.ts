
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { UserProvider } from "./UserProvider";
import { registerImageRoutes } from "./routes/imageRoutes";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const mongoClient = connectMongo();
let imageProvider: ImageProvider;
let userProvider: UserProvider;

mongoClient.connect().then(async () => {
    const collections = await mongoClient.db().listCollections().toArray();
    imageProvider = new ImageProvider(mongoClient);
    userProvider = new UserProvider(mongoClient);
    
    registerImageRoutes(app, imageProvider, userProvider);
}).catch(error => {
    console.error("Failed to connect to MongoDB:", error);
});

const app = express();

app.use(express.json());  // for parsing application/json
app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

Object.values(ValidRoutes).forEach(route => {
    app.get(route, (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "..", STATIC_DIR, "index.html"));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});