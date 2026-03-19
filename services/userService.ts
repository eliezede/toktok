import { arrayRemove, arrayUnion, doc, increment, updateDoc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types';

export class UserService {
    private static COLLECTION = 'users';
    private static PROPERTIES_COLLECTION = 'properties';

    /**
     * Toggles whether a property is "saved" (favorited) by the user.
     */
    static async toggleSaveProperty(userId: string, propertyId: string, isSaved: boolean) {
        try {
            const userRef = doc(db, this.COLLECTION, userId);
            await updateDoc(userRef, {
                savedProperties: isSaved ? arrayRemove(propertyId) : arrayUnion(propertyId)
            });
        } catch (error) {
            console.error("Error toggling save property:", error);
            throw error;
        }
    }

    /**
     * Toggles whether a property is "liked" by the user.
     */
    static async toggleLikeProperty(userId: string, propertyId: string, agentId: string, isLiked: boolean) {
        try {
            const userRef = doc(db, this.COLLECTION, userId);
            const propertyRef = doc(db, this.PROPERTIES_COLLECTION, propertyId);
            
            // 1. Update user's liked properties list
            await updateDoc(userRef, {
                likedProperties: isLiked ? arrayUnion(propertyId) : arrayRemove(propertyId)
            });

            // 2. Update property's likeCount
            await updateDoc(propertyRef, {
                likeCount: increment(isLiked ? 1 : -1)
            });
        } catch (error) {
            console.error("Error toggling like property:", error);
            throw error;
        }
    }

    /**
     * Toggles whether a user is following an agent or agency.
     */
    static async toggleFollowAgent(userId: string, agentId: string, isFollowing: boolean) {
        console.log(`[UserService] toggleFollowAgent START:`, { userId, agentId, isFollowing });
        const userRef = doc(db, this.COLLECTION, userId);
        const agentRef = doc(db, this.COLLECTION, agentId);

        try {
            console.log(`[UserService] Step 1: Updating User following list...`);
            await updateDoc(userRef, {
                followedAgents: isFollowing ? arrayRemove(agentId) : arrayUnion(agentId)
            });
            console.log(`[UserService] Step 1 SUCCESS`);
        } catch (error: any) {
            console.error(`[UserService] Step 1 ERROR (User following list):`, {
                code: error.code,
                message: error.message,
                userId: userId
            });
            throw new Error(`Failed to update your following list: ${error.message}`);
        }

        try {
            console.log(`[UserService] Step 2: Updating Agent follower count...`);
            await updateDoc(agentRef, {
                followerCount: increment(isFollowing ? -1 : 1)
            });
            console.log(`[UserService] Step 2 SUCCESS`);
        } catch (error: any) {
            console.error(`[UserService] Step 2 ERROR (Agent follower count):`, {
                code: error.code,
                message: error.message,
                agentId: agentId
            });
            throw new Error(`Failed to update agent follower count: ${error.message}`);
        }
        
        console.log(`[UserService] toggleFollowAgent FULL SUCCESS`);
    }

    /**
     * Fetches a user profile by ID.
     */
    static async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const userRef = doc(db, this.COLLECTION, userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                return { id: userSnap.id, ...userSnap.data() } as UserProfile;
            }
            return null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    }

    /**
     * Updates the profile image URL for a user.
     */
    static async updateProfileImage(userId: string, imageUrl: string) {
        try {
            const userRef = doc(db, this.COLLECTION, userId);
            await updateDoc(userRef, {
                profileImage: imageUrl
            });
        } catch (error) {
            console.error("Error updating profile image:", error);
            throw error;
        }
    }

    /**
     * Updates arbitrary profile fields for a user.
     */
    static async updateProfile(userId: string, data: Partial<UserProfile>) {
        try {
            const userRef = doc(db, this.COLLECTION, userId);
            await updateDoc(userRef, {
                ...data,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }

    /**
     * Fetches featured agents (verified or with most followers).
     */
    static async getFeaturedAgents(limitCount: number = 5): Promise<UserProfile[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('isVerified', '==', true),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        } catch (error) {
            console.error("Error fetching featured agents:", error);
            return [];
        }
    }
    /**
     * Submits a verification request with a document.
     */
    static async submitVerificationRequest(userId: string, creci: string, documentUri: string) {
        try {
            const userRef = doc(db, this.COLLECTION, userId);
            
            await updateDoc(userRef, {
                creci: creci,
                verificationStatus: 'pending',
                verificationSubmittedAt: new Date().toISOString()
            });
            
            console.log(`[UserService] Verification request submitted for ${userId}`);
        } catch (error) {
            console.error("Error submitting verification request:", error);
            throw error;
        }
    }
}
