import AppError from "../errors/AppError.js";
import { v4 as uuidv4 } from "uuid";

export default class ImageUploader {
    constructor(client) {
        this.client = client;
    }

    async uploadImage(path, id, tag) {
        try {
            const uploadResult = await this.client.uploader.upload(path, { public_id: id, tags: tag })
            return uploadResult
        } catch (error) {
            throw new AppError(error.message, 500)
        }
    }

    async uploadMultipleImage(paths, tag) {
        const uploadedResults = []
        for (const path of paths) {
            const id = uuidv4()
            const uploadedResult = await this.uploadImage(path, id, tag)
            uploadedResults.push(uploadedResult.secure_url)
        }
        return uploadedResults
    }

    async viewImage(id) {
        try {

            const optimizeUrl = this.client.url(id, {
                fetch_format: 'auto',
                quality: 'auto'
            })
            return optimizeUrl

        } catch (error) {
            throw new AppError(error.message, 500)
        }

    }
}
