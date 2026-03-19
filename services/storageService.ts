import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export class StorageService {
    /**
     * Uploads a file to Firebase Storage.
     * @param uri The local URI of the file.
     * @param path The path where the file should be stored.
     */
    static async uploadFile(uri: string, path: string): Promise<string> {
        try {
            // Fetch the image as a blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create a storage reference
            const storageRef = ref(storage, path);

            // Upload the blob
            await uploadBytes(storageRef, blob);

            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }

    /**
     * Specifically uploads a profile image for a user.
     */
    static async uploadProfileImage(userId: string, uri: string): Promise<string> {
        const path = `profile_images/${userId}.jpg`;
        return this.uploadFile(uri, path);
    }
}
