import { ListingDraft } from '../../types';
import { ListingImportResponse } from './importContracts';
import { SocialAuthService, SocialPlatform } from './socialAuthService';

export class ListingImportService {
    /**
     * Imports a listing from a URL by fetching HTML and parsing metadata.
     */
    static async importFromUrl(url: string, manualHtml?: string): Promise<ListingImportResponse> {
        const startTime = Date.now();
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');
            let platform: SocialPlatform | 'generic' = 'generic';

            if (domain.includes('instagram.com')) platform = 'instagram';
            else if (domain.includes('tiktok.com')) platform = 'tiktok';

            let html = '';
            let socialCookie = process.env.EXPO_PUBLIC_SOCIAL_COOKIE || '';

            if (typeof manualHtml === 'string' && manualHtml.trim().length > 0) {
                console.log(`[ListingImportService] Using manually provided HTML (${manualHtml.length} chars)`);
                html = manualHtml;
            } else {
                // Retrieve authenticated cookies if available
                if (platform !== 'generic') {
                    const storedCookies = await SocialAuthService.getCookies(platform);
                    if (storedCookies) {
                        socialCookie = storedCookies.trim();
                        if (socialCookie && !socialCookie.endsWith(';')) socialCookie += ';';
                        console.log(`[ListingImportService] Using ${platform} session cookies (${socialCookie.length} chars)`);
                    }
                }

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Cookie': socialCookie
                    }
                });

                if (!response.ok) {
                    throw new Error(`Website returned error ${response.status}`);
                }

                html = await response.text();
            }

            if (!html || typeof html !== 'string') {
                throw new Error('Failed to retrieve valid HTML from source.');
            }

            // Debug first 150 chars to identify block/redirect
            console.log(`[ListingImportService] Processing HTML (${html.length} chars). Preview: ${html.substring(0, 150).replace(/\n/g, ' ')}...`);

            // 1. Check if blocked and try EMBED fallback for social platforms
            const isLoginPage = (html.includes('login_form') || html.includes('password') || html.includes('\"login\"')) &&
                (html.includes('Accounts') || html.includes('entrar') || html.includes('signup'));

            const noVideoInMain = !html.match(/og:video/i) && !html.includes('.mp4') && !html.includes('xdt_shortcode_media') && !html.includes('video_url');

            if (platform !== 'generic' && (isLoginPage || noVideoInMain)) {
                console.log(`[ListingImportService] No video found in main HTML (Blocked: ${isLoginPage}). Trying embed fallback...`);
                try {
                    let embedUrl = '';
                    if (platform === 'instagram') {
                        const shortcodeMatch = url.match(/(?:\/p\/|\/reels\/|\/reel\/)([^/?#&]+)/);
                        if (shortcodeMatch) {
                            embedUrl = `https://www.instagram.com/reel/${shortcodeMatch[1]}/embed/captioned/`;
                        }
                    } else if (platform === 'tiktok') {
                        const ttIdMatch = url.match(/\/video\/(\d+)/);
                        if (ttIdMatch) {
                            embedUrl = `https://www.tiktok.com/embed/v2/${ttIdMatch[1]}`;
                        }
                    }

                    if (embedUrl) {
                        const embedResponse = await fetch(embedUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                'Cookie': socialCookie
                            }
                        });
                        if (embedResponse.ok) {
                            const embedHtml = await embedResponse.text();
                            if (embedHtml.includes('.mp4') || embedHtml.includes('video_url')) {
                                html = embedHtml;
                                console.log('[ListingImportService] Successfully switched to embed HTML');
                            }
                        }
                    }
                } catch (err) {
                    console.error('Embed fallback failed:', err);
                }
            }

            const getMeta = (name: string) => {
                const regex = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
                return html.match(regex)?.[1];
            };

            // 2. Extract Metadata (Title, Desc, Image)
            let title = getMeta('og:title') || getMeta('twitter:title') || html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
            let description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description') || '';
            const image = getMeta('og:image') || getMeta('twitter:image') || '';

            // 3. Extract Video (Robust Extraction)
            let video = getMeta('og:video') || getMeta('og:video:url') || getMeta('og:video:secure_url') || '';

            if (!video) {
                console.log('[ListingImportService] video not found via meta. searching JSON/Scripts...');
                // Deep search in scripts/JSON (supports Instagram GraphQL and standard keys)
                const vidRegex = /"(?:video_url|downloadAddr|playAddr|video_dash_manifest)":"([^"]+)"/g;
                let m;
                while ((m = vidRegex.exec(html)) !== null) {
                    let candidate = m[1].replace(/\\u0026/g, '&').replace(/&amp;/g, '&').replace(/\\/g, '');
                    if (candidate.includes('.mp4') || candidate.includes('scontent') || candidate.includes('video_url')) {
                        video = candidate;
                        console.log('[ListingImportService] Video found via JSON key matching');
                        break;
                    }
                }

                if (!video) {
                    // Try to extract from script with xdt_shortcode_media (Instagram Logged-In)
                    const instaLoggedMatch = html.match(/"video_url":"([^"]+)"/);
                    if (instaLoggedMatch) {
                        video = instaLoggedMatch[1].replace(/\\u0026/g, '&').replace(/&amp;/g, '&').replace(/\\/g, '');
                        console.log('[ListingImportService] Video found via xdt_shortcode_media pattern');
                    }
                }

                if (!video) {
                    // Final fallback: searching for scontent mp4 links anywhere in text
                    const cdnRegex = /https:\/\/scontent[^"']+\.mp4[^"']+/g;
                    const cdnMatch = html.match(cdnRegex);
                    if (cdnMatch) {
                        video = cdnMatch[0].replace(/\\u0026/g, '&').replace(/&amp;/g, '&').replace(/\\/g, '');
                        console.log('[ListingImportService] Video found via generic scontent regex');
                    }
                }
            }

            // 4. Heuristics for Price & Specs
            const priceRegex = /(?:[$€£]|R\$)\s?([\d.,]+)|([\d.,]+)\s?(?:USD|EUR|BRL)/i;
            const priceMatch = html.match(priceRegex);
            let extractedPrice = 0;
            if (priceMatch) {
                const val = priceMatch[1] || priceMatch[2];
                extractedPrice = parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
            }

            const bedRegex = /(\d+)\s*(?:bd|bedroom|quarto|hab)/i;
            const suiteRegex = /(\d+)\s*(?:suite|suíte|ste)/i;
            const bathRegex = /(\d+)\s*(?:ba|bath|banheiro|wc)/i;
            const parkingRegex = /(\d+)\s*(?:vaga|parking|garagem|gar)/i;
            const condoRegex = /(?:condo|condomínio|cond)\s*(?:[:$]|R\$)\s?([\d.,]+)/i;
            const iptuRegex = /iptu\s*(?:[:$]|R\$)\s?([\d.,]+)/i;

            const bedrooms = parseInt(html.match(bedRegex)?.[1] || '0');
            const suites = parseInt(html.match(suiteRegex)?.[1] || '0');
            const bathrooms = parseInt(html.match(bathRegex)?.[1] || '0');
            const parkingSpaces = parseInt(html.match(parkingRegex)?.[1] || '0');

            const condoMatch = html.match(condoRegex);
            const condoFee = condoMatch ? parseFloat(condoMatch[1].replace(/\./g, '').replace(',', '.')) : 0;

            const iptuMatch = html.match(iptuRegex);
            const iptu = iptuMatch ? parseFloat(iptuMatch[1].replace(/\./g, '').replace(',', '.')) : 0;

            // Detect Listing Type (Rent vs Sale)
            let listingType: 'sale' | 'rent' = 'sale'; // Default
            if (html.match(/aluguel|locação|rent|alugar/i)) {
                listingType = 'rent';
            }

            // Detect Property Type
            let propertyType: any = 'apartment';
            const typeKeywords: Record<string, string> = {
                'casa': 'house',
                'sobrado': 'house',
                'terreno': 'land',
                'lote': 'land',
                'cobertura': 'penthouse',
                'studio': 'studio',
                'kitnet': 'studio',
                'comercial': 'commercial',
                'sala': 'commercial',
                'fazenda': 'farm',
                'sitio': 'farm',
                'vila': 'villa'
            };

            for (const [key, val] of Object.entries(typeKeywords)) {
                if (html.toLowerCase().includes(key)) {
                    propertyType = val;
                    break;
                }
            }

            // Detect CEP
            const cepMatch = html.match(/\d{5}-\d{3}/) || html.match(/\b\d{8}\b/);
            let postalCode = cepMatch ? cepMatch[0] : '';

            // Specialized cleanup for Instagram/TikTok captions
            if (platform !== 'generic') {
                // Try to find a cleaner caption in embed data
                const captionMatch = html.match(/"caption":"([^"]+)"/) || html.match(/class="CaptionUsername"[^>]*>.*?<\/a>\s*([^<]+)/s);
                if (captionMatch) {
                    const rawCaption = captionMatch[1].replace(/\\n/g, '\n').replace(/\\u0026/g, '&').replace(/<[^>]*>/g, '').trim();
                    if (rawCaption.length > 5) {
                        description = rawCaption;
                        // Re-run heuristics on cleaned caption for better accuracy
                        if (rawCaption.match(/aluguel|locação|rent|alugar/i)) listingType = 'rent';
                        for (const [key, val] of Object.entries(typeKeywords)) {
                            if (rawCaption.toLowerCase().includes(key)) {
                                propertyType = val;
                                break;
                            }
                        }
                        const captionCep = rawCaption.match(/\d{5}-\d{3}/) || rawCaption.match(/\b\d{8}\b/);
                        if (captionCep && !postalCode) {
                            postalCode = captionCep[0];
                        }
                    }
                }
            }

            return {
                success: true,
                data: {
                    normalized: {
                        listingTitle: title.trim(),
                        descriptionLong: description.trim(),
                        listingType,
                        propertyType,
                        price: extractedPrice,
                        bedrooms,
                        suites,
                        bathrooms,
                        parkingSpaces,
                        condoFee,
                        iptu,
                        postalCode: postalCode || '',
                        imageUrls: image ? [image] : [],
                        videoUrl: video || '',
                        currency: 'BRL',
                        country: 'Brasil'
                    },
                    fieldConfidence: {
                        listingTitle: { value: title, confidence: 0.9, confidenceLevel: 'high', source: 'structured_data', normalized: true },
                        listingType: { value: listingType, confidence: 0.5, confidenceLevel: 'medium', source: 'html_parser', normalized: true },
                        price: { value: extractedPrice, confidence: 0.6, confidenceLevel: 'medium', source: 'html_parser', normalized: true },
                        descriptionLong: { value: description, confidence: 0.8, confidenceLevel: 'high', source: 'structured_data', normalized: true },
                        videoUrl: { value: video, confidence: video ? 0.9 : 0.1, confidenceLevel: video ? 'high' : 'missing', source: 'html_parser', normalized: true },
                        bedrooms: { value: bedrooms, confidence: 0.7, confidenceLevel: 'medium', source: 'html_parser', normalized: true },
                        bathrooms: { value: bathrooms, confidence: 0.7, confidenceLevel: 'medium', source: 'html_parser', normalized: true }
                    },
                    metadata: {
                        sourceUrl: url,
                        sourcePlatform: platform,
                        importSourceType: platform === 'generic' ? 'property_url' : 'social_post',
                        extractionMethod: 'html_parser',
                        importConfidenceScore: video ? 0.9 : 0.5,
                        importWarnings: [
                            isLoginPage ? 'A plataforma bloqueou o acesso automático (Login Detectado). Tente novamente.' : null,
                            !video && platform !== 'generic' ? 'Não foi possível encontrar o vídeo original. Verifique se o perfil é público.' : null,
                            platform !== 'generic'
                                ? 'Importado de rede social (Modo Embed). Verifique se os dados estão corretos.'
                                : 'Extraído automaticamente de portal. Verifique preço e detalhes.'
                        ].filter(Boolean) as string[],
                        needsReview: true,
                        importedAt: Date.now(),
                        importedByUserId: 'system',
                        parserVersion: '2.5.0',
                        aiUsed: false,
                        normalizationVersion: '1.0.1'
                    },
                    warnings: [],
                    diagnostics: {
                        extractionTime: Date.now() - startTime,
                        parserVersion: '2.5.0',
                        method: 'regex_parsing_with_embed_fallback',
                        platform: domain
                    }
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    code: 'FETCH_FAILED',
                    message: `Could not reach the website: ${error.message || 'Connection blocked.'} Portals often block automation.`,
                    recoverable: true
                }
            };
        }
    }

    /**
     * Maps a raw import response into a ListingDraft for the form.
     */
    static buildDraftFromResponse(response: ListingImportResponse): ListingDraft {
        if (!response.success || !response.data) {
            return {
                isImported: false,
                fields: {},
                lastEditedAt: Date.now(),
                validationStatus: 'incomplete'
            };
        }

        const { normalized, fieldConfidence, metadata } = response.data;

        return {
            isImported: true,
            fields: normalized,
            fieldConfidence: fieldConfidence,
            importMetadata: metadata,
            lastEditedAt: Date.now(),
            validationStatus: 'incomplete' // Needs review
        };
    }

    /**
     * Normalizes a partially filled draft with default values.
     */
    static normalizeDraftInPlace(draft: ListingDraft): void {
        const fields = draft.fields;

        // Ensure required arrays exist
        if (!fields.features) fields.features = [];
        if (!fields.amenities) fields.amenities = [];
        if (!fields.imageUrls) fields.imageUrls = [];

        // Defaults for required numeric fields if missing
        if (fields.price === undefined) fields.price = 0;
        if (fields.bedrooms === undefined) fields.bedrooms = 0;
        if (fields.suites === undefined) fields.suites = 0;
        if (fields.bathrooms === undefined) fields.bathrooms = 0;
        if (fields.parkingSpaces === undefined) fields.parkingSpaces = 0;
        if (fields.areaValue === undefined) fields.areaValue = 0;
        if (fields.condoFee === undefined) fields.condoFee = 0;
        if (fields.iptu === undefined) fields.iptu = 0;

        if (!fields.listingType) fields.listingType = 'sale';
        if (!fields.propertyType) fields.propertyType = 'apartment';
    }
}
