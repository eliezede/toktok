export type UserRole = 'buyer' | 'agent' | 'agency' | 'admin';

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    profileImage?: string;
    phone?: string;
    whatsapp?: string;
    bio?: string;
    city?: string;
    state?: string;
    accountPlan?: 'Free' | 'Pro' | 'Agency Pro';
    isVerified: boolean;
    createdAt: number;
    followerCount?: number;
    followingCount?: number;

    // Buyer/General specifics
    savedProperties?: string[];
    likedProperties?: string[];
    followedAgents?: string[];
    interests?: string[];
    budgetRange?: {
        min: number;
        max: number;
    };

    // Professional specifics (Common)
    serviceRegions?: string[];
    languages?: string[];
    socialMedia?: {
        instagram?: string;
        website?: string;
        linkedin?: string;
    };

    // Agent (Corretor) specifics
    creciNumber?: string;
    creciState?: string;
    creciDocumentUrl?: string;
    experienceYears?: number;

    // Agency (Imobiliária) specifics
    agencyName?: string;
    cnpj?: string;
    creciCompany?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    teamSize?: number;
    foundedYear?: number;
    specialties?: string[];

    // System Metrics
    metrics?: {
        activeListings: number;
        responseRate: number;
        avgResponseTime: number;
    };
    notifications?: {
        push: boolean;
        email: boolean;
    };
}

export type PropertyType = 'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'penthouse' | 'farm' | 'studio';
export type ListingType = 'sale' | 'rent' | 'seasonal';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'missing';
export type ExtractionMethod = 'deterministic' | 'html_parser' | 'ai' | 'manual' | 'social_context';
export type FieldSourceType = 'structured_data' | 'html_parser' | 'ai' | 'manual';
export type ImportSourcePlatform = 'generic' | 'instagram' | 'tiktok' | 'portal_x' | 'agency_website';

export interface ImportedField<T> {
    value: T;
    confidence: number;
    confidenceLevel: ConfidenceLevel;
    source: FieldSourceType;
    normalized: boolean;
}

export interface ListingImportMetadata {
    sourceUrl: string;
    sourcePlatform: ImportSourcePlatform;
    importSourceType: 'property_url' | 'social_post' | 'manual';
    extractionMethod: ExtractionMethod;
    importConfidenceScore: number;
    importWarnings: string[];
    rawExtractedData?: any;
    needsReview: boolean;
    importedAt: number;
    importedByUserId: string;
    parserVersion: string;
    aiUsed: boolean;
    aiModel?: string;
    aiPromptVersion?: string;
    normalizationVersion: string;
}

export interface PropertyListing {
    id: string;

    // Core listing fields
    listingTitle: string;
    listingType: ListingType;
    propertyType: PropertyType;
    propertySubType?: string;
    listingStatus: 'active' | 'inactive' | 'sold' | 'rented' | 'reserved' | 'archived';
    descriptionShort?: string;
    descriptionLong: string;

    // Pricing
    price: number;
    currency: string;
    priceFrequency?: 'total' | 'monthly' | 'daily';
    condoFee?: number;
    iptu?: number;
    priceQualifier?: string;

    // Property specs
    bedrooms: number;
    suites?: number;
    bathrooms: number;
    parkingSpaces?: number;
    areaValue: number;
    areaUnit: 'sqm' | 'sqft';
    totalAreaValue?: number;
    totalAreaUnit?: 'sqm' | 'sqft';
    furnished?: boolean;
    petFriendly?: boolean;
    acceptsFinancing?: boolean;
    acceptsExchange?: boolean;
    condition?: string;
    floor?: string;
    yearBuilt?: number;

    // Location
    addressLine1: string;
    addressLine2?: string;
    neighborhood: string;
    city: string;
    region?: string;
    country: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    publicLocationMode?: 'approximate' | 'exact';

    // Features/media
    amenities: string[];
    features: string[]; // Extra tags/features
    videoUrl: string;
    videoId?: string;
    thumbnailUrl?: string;
    imageUrls: string[];

    // Contact & Meta
    contactPhone: string;
    contactWhatsApp?: string;
    createdBy: string;
    createdAt: number;
    floorPlanUrl?: string;

    // Import Metadata
    importMetadata?: ListingImportMetadata;

    // Promotion/Monetization logic
    isPromoted: boolean;
    promotionTier?: number;
    promotionStartDate?: number;
    promotionEndDate?: number;
    sponsoredWeight?: number;

    // Engagement
    likeCount?: number;
    commentCount?: number;
}

export interface ListingDraft {
    id?: string;
    fields: Partial<PropertyListing>;
    fieldConfidence?: Record<string, ImportedField<any>>;
    importMetadata?: ListingImportMetadata;
    isImported: boolean;
    lastEditedAt: number;
    validationStatus: 'valid' | 'invalid' | 'incomplete';
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
