import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export type NotificationType = 'like' | 'comment' | 'message' | 'follow' | 'property_alert' | 'system_update';

export interface AppNotification {
    id?: string;
    type: NotificationType;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    targetId?: string; // e.g., propertyId or chatId
    message: string;
    read: boolean;
    createdAt: any;
}

export const NotificationService = {
    async addNotification(userId: string, notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
        try {
            const notificationsRef = collection(db, 'users', userId, 'notifications');
            await addDoc(notificationsRef, {
                ...notification,
                read: false,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    },

    getUserNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
        const notificationsRef = collection(db, 'users', userId, 'notifications');
        const q = query(notificationsRef, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AppNotification));
            callback(notifications);
        });
    },

    // Specific triggers
    async notifyLike(senderId: string, senderName: string, recipientId: string, propertyId: string) {
        if (senderId === recipientId) return;
        await this.addNotification(recipientId, {
            type: 'like',
            senderId,
            senderName,
            targetId: propertyId,
            message: `curtiu seu imóvel.`,
        });
    },

    async notifyFollow(senderId: string, senderName: string, recipientId: string) {
        if (senderId === recipientId) return;
        await this.addNotification(recipientId, {
            type: 'follow',
            senderId,
            senderName,
            message: `começou a seguir você.`,
        });
    },

    async notifyMessage(senderId: string, senderName: string, recipientId: string, chatId: string, text: string) {
        if (senderId === recipientId) return;
        await this.addNotification(recipientId, {
            type: 'message',
            senderId,
            senderName,
            targetId: chatId,
            message: `enviou uma mensagem: "${text}"`,
        });
    },

    async notifyComment(senderId: string, senderName: string, recipientId: string, propertyId: string, text: string) {
        if (senderId === recipientId) return;
        await this.addNotification(recipientId, {
            type: 'comment',
            senderId,
            senderName,
            targetId: propertyId,
            message: `comentou no seu imóvel: "${text}"`,
        });
    }
};
