import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider";
import { UserProvider } from "../UserProvider";
import { IApiImageData } from "../common/ApiImageData";
import "../middleware/authMiddleware";
import { imageMiddlewareFactory, handleImageFileErrors } from "../middleware/imageUploadMiddleware";

const MAX_NAME_LENGTH = 100;

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

export function registerImageRoutes(
    app: express.Application, 
    imageProvider: ImageProvider,
    userProvider: UserProvider
) {
    app.get("/api/images", async (req: Request, res: Response) => {
        await waitDuration(1000);
        
        try {
            const images = await imageProvider.getAllImages();
            
            const apiImages: IApiImageData[] = images.map((image: any) => ({
                id: image._id.toString(),
                src: image.src,
                name: image.name,
                author: { 
                    id: image.authorId, 
                    username: image.authorId,
                    email: `${image.authorId}@example.com`
                }
            }));
            
            res.json(apiImages);
        } catch (error) {
            console.error("Error fetching images:", error);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    });

    app.get("/api/images/search", async (req: Request, res: Response) => {
        const searchQuery = req.query.q as string;
        
        console.log("Search query received:", searchQuery);
        
        if (!searchQuery) {
            res.status(400).json({ error: "Query parameter 'q' is required" });
            return;
        }
        
        await waitDuration(1000);
        
        try {
            const images = await imageProvider.getImages(searchQuery);
            
            const apiImages: IApiImageData[] = images.map((image: any) => ({
                id: image._id.toString(),
                src: image.src,
                name: image.name,
                author: { 
                    id: image.authorId, 
                    username: image.authorId,
                    email: `${image.authorId}@example.com`
                }
            }));
            
            res.json(apiImages);
        } catch (error) {
            console.error("Error searching images:", error);
            res.status(500).json({ error: "Failed to search images" });
        }
    });

    app.put("/api/images/:imageId", async (req: Request, res: Response) => {
        const imageId = req.params.imageId;
        const { name: newName } = req.body;

        if (!newName || typeof newName !== 'string') {
            res.status(400).send({
                error: "Bad Request",
                message: "Name is required and must be a string"
            });
            return;
        }

        if (newName.length > MAX_NAME_LENGTH) {
            res.status(422).send({
                error: "Unprocessable Entity",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
            return;
        }

        if (!ObjectId.isValid(imageId)) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
            return;
        }

        try {
            const image = await imageProvider.getImageById(imageId);
            
            if (!image) {
                res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
                return;
            }
            
            const loggedInUsername = req.user?.username;
            
            console.log("Image authorId: ", image.authorId);
            console.log("Logged in user: ", loggedInUsername);
            if (!loggedInUsername || image.authorId !== loggedInUsername) {
                res.status(403).send({
                    error: "Forbidden",
                    message: "You can only edit images you own"
                });
                return;
            }
            
            const matchedCount = await imageProvider.updateImageName(imageId, newName);
            
            if (matchedCount === 0) {
                res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
                return;
            }
            
            res.status(204).send();
        } catch (error) {
            console.error("Error updating image name:", error);
            res.status(500).json({ error: "Failed to update image name" });
        }
    });

    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req: Request, res: Response) => {
            if (!req.file) {
                res.status(400).send({
                    error: "Bad Request",
                    message: "No image file uploaded"
                });
                return;
            }
            const { name } = req.body;
            if (!name || typeof name !== 'string') {
                res.status(400).send({
                    error: "Bad Request", 
                    message: "Image name is required"
                });
                return;
            }

            const loggedInUsername = req.user?.username;
            if (!loggedInUsername) {
                res.status(401).send({
                    error: "Unauthorized",
                    message: "Authentication required"
                });
                return;
            }

            try {
                const src = `/uploads/${req.file.filename}`;
                const imageId = await imageProvider.createImage(src, name, loggedInUsername);
                
                res.status(201).send();
            } catch (error) {
                console.error("Error creating image:", error);
                res.status(500).send({
                    error: "Internal Server Error",
                    message: "Failed to save image"
                });
            }
        }
    );
}