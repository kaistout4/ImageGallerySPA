import { MongoClient, Collection, ObjectId } from "mongodb";
import { IApiImageData, IApiUserData } from "./common/ApiImageData";

interface IImageDocument {
    _id?: ObjectId;
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
        return this.collection.find().toArray();
    }

    searchImagesByName(searchQuery: string) {
        return this.collection.find({
            name: { $regex: searchQuery, $options: 'i' }
        }).toArray();
    }

    getImages(nameFilter?: string) {
        if (nameFilter) {
            return this.collection.find({
                name: { $regex: nameFilter, $options: 'i' }
            }).toArray();
        }
        return this.collection.find().toArray();
    }

    async updateImageName(imageId: string, newName: string): Promise<number> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );
        return result.matchedCount;
    }
}