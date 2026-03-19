import { ImportedField, ListingImportMetadata, PropertyListing } from '../../types';

export interface ListingImportRequest {
    url: string;
}

export interface ImportWarning {
    code: string;
    message: string;
    field?: string;
    severity: 'low' | 'medium' | 'high';
}

export interface ImportDiagnostics {
    extractionTime: number;
    parserVersion: string;
    method: string;
    platform: string;
}

export interface ListingImportResponse {
    success: boolean;
    data?: {
        normalized: Partial<PropertyListing>;
        fieldConfidence: Record<string, ImportedField<any>>;
        metadata: ListingImportMetadata;
        warnings: ImportWarning[];
        diagnostics: ImportDiagnostics;
    };
    error?: {
        code: string;
        message: string;
        recoverable: boolean;
    };
}
