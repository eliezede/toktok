import { db } from '../../firebase/config';
import { PropertyListing } from '../../types';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

export class PropertyQueryService {
    private static COLLECTION = 'properties';

    /**
     * Fetches all public property listings from Firestore.
     * Filters out archived posts and potentially sold/reserved if needed.
     */
    static async getListings(limitCount: number = 20, hideSold: boolean = false, hideReserved: boolean = false): Promise<PropertyListing[]> {
        console.log("[PropertyQueryService] Fetching listings with params:", { limitCount, hideSold, hideReserved });
        
        // Stage 1: Try the filtered "in" query
        try {
            const allowedStatuses = ['active'];
            if (!hideSold) allowedStatuses.push('sold', 'rented');
            if (!hideReserved) allowedStatuses.push('reserved');

            const q = query(
                collection(db, this.COLLECTION),
                where('listingStatus', 'in', allowedStatuses),
                orderBy('listingStatus'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropertyListing));
            }
        } catch (error) {
            console.warn("[PropertyQueryService] Primary query failed:", error);
        }

        // Stage 2: Fallback to a simple query for legacy/all (catches docs missing fields)
        try {
            const fallbackQ = query(
                collection(db, this.COLLECTION),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const snapshot = await getDocs(fallbackQ);
            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as PropertyListing))
                .filter(p => p.listingStatus !== 'archived');
        } catch (error) {
            console.error("[PropertyQueryService] Ultimate fallback failed (Permissions issue?):", error);
            // If even the simple query fails, the rules are definitely blocking us
            return [];
        }
    }

    /**
     * Fetches a single property listing by ID.
     */
    static async getListingById(id: string): Promise<PropertyListing | null> {
        try {
            const docRef = doc(db, this.COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as PropertyListing;
            }
            return null;
        } catch (error) {
            console.error("Error fetching listing:", error);
            return null;
        }
    }

    /**
     * Fetches listings created by a specific agent or agency.
     */
    static async getListingsByAgent(agentId: string): Promise<PropertyListing[]> {
        console.log(`[PropertyQueryService] Fetching listings for agent: "${agentId}"`);
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('createdBy', '==', agentId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            console.log(`[PropertyQueryService] Found ${querySnapshot.docs.length} listings for agent: "${agentId}"`);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PropertyListing));
        } catch (error: any) {
            console.error("[PropertyQueryService] Error fetching agent listings:", error);
            if (error.message?.includes("index")) {
                console.error("[PropertyQueryService] This query might require a composite index. Check the console for the link.");
            }
            return [];
        }
    }
}
