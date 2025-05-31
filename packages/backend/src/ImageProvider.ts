import { MongoClient, Collection } from "mongodb";
import { IApiImageData, IApiUserData } from "./common/ApiImageData";

interface IImageDocument {
    id: string;
    src: string;
    name: string;
    author: string;
}

export class ImageProvider {
    private collection: Collection<IImageDocument>

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    getAllImages() {
        return this.collection.find().toArray(); // Without any options, will by default get all documents in the collection as an array.
    }
}