import * as VideoThumbnails from 'expo-video-thumbnails';
import { db, storage } from '../../firebase/config';
import { PropertyListing } from '../../types';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class PropertyActionService {
    private static COLLECTION = 'properties';

    /**
     * Helper to upload media to Storage
     */
    static async uploadMedia(uri: string, path: string): Promise<string> {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    }

    /**
     * Creates a new property listing with its associated video document.
     */
    static async createListing(
        userId: string,
        data: Partial<PropertyListing>,
        videoUri: string,
        imageUris: string[] = []
    ): Promise<string> {
        const propertyId = `prop_${Date.now()}`;
        const videoId = `vid_${Date.now()}`;

        // 1. Create video doc with status 'uploading'
        await setDoc(doc(db, 'videos', videoId), {
            id: videoId,
            propertyId,
            userId,
            status: 'uploading',
            createdAt: Date.now(),
            playbackType: 'hls'
        });

        // 1.5 Generate and upload thumbnail from video
        let thumbnailUrl = '';
        try {
            console.log("[PropertyActionService] Generating thumbnail for:", videoUri);
            const thumb = await VideoThumbnails.getThumbnailAsync(videoUri, {
                time: 1000, // Capture at 1 second mark
                quality: 0.8
            });
            thumbnailUrl = await this.uploadMedia(thumb.uri, `properties/${propertyId}/thumbnail.jpg`);
            console.log("[PropertyActionService] Thumbnail uploaded:", thumbnailUrl);
        } catch (e) {
            console.error("[PropertyActionService] Error generating thumbnail:", e);
        }

        // 2. Upload video
        const videoUrl = await this.uploadMedia(videoUri, `uploads/videos/${userId}/${videoId}/original.mp4`);

        // 3. Upload photos
        const imageUrls = await Promise.all(
            imageUris.map((uri: string, idx: number) => 
                this.uploadMedia(uri, `properties/${propertyId}/photo_${idx}.jpg`)
            )
        );

        // 4. Create property doc
        const fullPropertyData: PropertyListing = {
            ...data,
            id: propertyId,
            videoId,
            videoUrl,
            thumbnailUrl,
            imageUrls,
            createdBy: userId,
            createdAt: Date.now(),
            listingStatus: 'active'
        } as PropertyListing;

        await setDoc(doc(db, this.COLLECTION, propertyId), fullPropertyData);

        // 5. Update video doc to reflect success
        await updateDoc(doc(db, 'videos', videoId), { status: 'ready', videoUrl });

        return propertyId;
    }

    /**
     * Updates a listing's data.
     */
    static async updateListing(id: string, data: Partial<PropertyListing>): Promise<void> {
        const docRef = doc(db, this.COLLECTION, id);
        await updateDoc(docRef, data);
    }

    /**
     * Specialized status update.
     */
    static async updateStatus(id: string, status: PropertyListing['listingStatus']): Promise<void> {
        return this.updateListing(id, { listingStatus: status });
    }

    /**
     * Archives a listing (hides from feed).
     */
    static async archiveListing(id: string): Promise<void> {
        return this.updateStatus(id, 'archived');
    }

    /**
     * Unarchives a listing.
     */
    static async unarchiveListing(id: string): Promise<void> {
        return this.updateStatus(id, 'active');
    }

    /**
     * Deletes a listing permanently.
     */
    static async deleteListing(id: string): Promise<void> {
        const docRef = doc(db, this.COLLECTION, id);
        await deleteDoc(docRef);
    }
}
