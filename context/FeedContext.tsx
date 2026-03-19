import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { createContext, useContext, useRef, useState } from 'react';
import { PropertyListing } from '../types';

interface FeedContextType {
    activeProperty: PropertyListing | null;
    setActiveProperty: (property: PropertyListing | null) => void;
    bottomSheetRef: React.RefObject<BottomSheetModal>;
    presentBottomSheet: () => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeProperty, setActiveProperty] = useState<PropertyListing | null>(null);
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const presentBottomSheet = () => {
        if (activeProperty && bottomSheetRef.current) {
            bottomSheetRef.current.present();
        }
    };

    return (
        <FeedContext.Provider value={{
            activeProperty,
            setActiveProperty,
            bottomSheetRef,
            presentBottomSheet
        }}>
            {children}
        </FeedContext.Provider>
    );
};

export const useFeed = () => {
    const context = useContext(FeedContext);
    if (!context) {
        throw new Error('useFeed must be used within a FeedProvider');
    }
    return context;
};
