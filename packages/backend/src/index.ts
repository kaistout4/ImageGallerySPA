import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { IMAGES } from "./common/ApiImageData";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

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
    res.json(IMAGES);
});

Object.values(ValidRoutes).forEach(route => {
    app.get(route, (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "..", STATIC_DIR, "index.html"));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});