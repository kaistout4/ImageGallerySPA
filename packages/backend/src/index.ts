import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { UserProvider } from "./UserProvider";
import { IApiImageData } from "./common/ApiImageData";

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
}).catch(error => {
    console.error("Failed to connect to MongoDB:", error);
});

const app = express();

app.use(express.static(STATIC_DIR));

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get("/api/images", async (req: Request, res: Response) => {
    await waitDuration(1000);
    
    try {
        const images = await imageProvider.getAllImages();

        const authorIds = [...new Set(images.map(img => img.author))];
        
        const users = await userProvider.getUsersByIds(authorIds);
        
        const userMap = new Map(users.map(user => [user.id, user]));
        
        const apiImages: IApiImageData[] = images.map(image => ({
            id: image.id,
            src: image.src,
            name: image.name,
            author: userMap.get(image.author) || { id: image.author, username: "Unknown User" }
        }));
        
        res.json(apiImages);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

Object.values(ValidRoutes).forEach(route => {
    app.get(route, (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "..", STATIC_DIR, "index.html"));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});