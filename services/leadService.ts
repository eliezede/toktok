import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';

export type LeadType = 'whatsapp_click' | 'view' | 'favorite';

export interface Lead {
    id?: string;
    propertyId: string;
    agentId: string;
    buyerId: string;
    buyerName?: string;
    buyerImage?: string;
    type: LeadType;
    createdAt: any;
}

export class LeadService {
    private static COLLECTION = 'leads';

    /**
     * Logs a new lead interaction.
     */
    static async logLead(lead: Omit<Lead, 'createdAt'>) {
        try {
            await addDoc(collection(db, this.COLLECTION), {
                ...lead,
                createdAt: serverTimestamp()
            });
            console.log(`[LeadService] Lead logged: ${lead.type} for property ${lead.propertyId}`);
        } catch (error) {
            console.error("Error logging lead:", error);
        }
    }

    /**
     * Fetches all leads for a specific agent.
     */
    static async getLeadsForAgent(agentId: string): Promise<Lead[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('agentId', '==', agentId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Lead));
        } catch (error) {
            console.error("Error fetching leads:", error);
            return [];
        }
    }
}
