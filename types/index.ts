export type UserRole = 'buyer' | 'agent' | 'agency' | 'admin';

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    profileImage?: string;
    phone?: string;
    bio?: string;
    city?: string;
    accountPlan?: 'Free' | 'Pro' | 'Agency Pro';
    isVerified: boolean;
    createdAt: number;

    // Buyer specifics
    savedProperties?: string[]; // IDs of saved properties
    followedAgents?: string[]; // IDs of followed agents/agencies

    // Agent/Agency specifics
    whatsapp?: string;
    followerCount?: number;
}

export type PropertyType = 'home' | 'apartment' | 'villa' | 'land' | 'commercial';

export interface PropertyListing {
    id: string;
    videoUrl: string;
    imageUrls: string[];
    title: string;
    description: string;
    price: number;
    propertyType: PropertyType;
    bedrooms: number;
    bathrooms: number;
    squareMeters: number;
    city: string;
    neighborhood: string;
    address: string;
    latitude?: number;
    longitude?: number;

    contactPhone: string;
    contactWhatsApp?: string;

    createdBy: string; // User ID
    createdAt: number;

    status: 'active' | 'inactive' | 'sold' | 'rented';
    operation: 'sale' | 'rent';
    features: string[];
    floorPlanUrl?: string;

    // Promotion/Monetization logic
    isPromoted: boolean;
    promotionTier?: number;
    promotionStartDate?: number;
    promotionEndDate?: number;
    sponsoredWeight?: number;
}

export interface Favorite {
    id: string;
    userId: string;
    propertyId: string;
    createdAt: number;
}

export interface Follow {
    id: string;
    followerId: string; // buyer
    followingId: string; // agent or agency
    createdAt: number;
}
