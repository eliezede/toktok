import React, { useRef, useState } from 'react';
import { 
    Modal, 
    StyleSheet, 
    View, 
    TouchableOpacity, 
    Text, 
    ActivityIndicator, 
    SafeAreaView,
    StatusBar 
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SocialAuthService, SocialPlatform } from '../../services/listingImport/socialAuthService';

interface SocialLoginModalProps {
    visible: boolean;
    platform: SocialPlatform;
    targetUrl?: string; // New: optional URL to navigate and extract from
    onClose: () => void;
    onSuccess: (html?: string) => void;
}

const INSTAGRAM_LOGIN_URL = 'https://www.instagram.com/accounts/login/';
const TIKTOK_LOGIN_URL = 'https://www.tiktok.com/login/';

// This script runs inside the WebView to extract cookies and report back
const INJECTED_JAVASCRIPT = `
(function() {
    console.log("TokTok Auth Script Active");
    function checkLogin() {
        const cookies = document.cookie;
        const url = window.location.href;
        
        // Instagram success markers
        const hasInstaAuth = cookies.includes('ds_user_id') || cookies.includes('sessionid');
        const isInstaHome = url.includes('instagram.com/') && !url.includes('accounts/login');

        // TikTok success markers
        const hasTikTokAuth = cookies.includes('tt_chain_token') || cookies.includes('sessionid');

        if (hasInstaAuth || hasTikTokAuth || isInstaHome) {
            // Signal login success
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'AUTH_SUCCESS',
                cookies: cookies,
                url: url,
                source: isInstaHome ? 'navigation_success' : 'cookie_detection'
            }));

            // If we are on a post page, also send the HTML
            if (url.includes('/p/') || url.includes('/reels/') || url.includes('/reel/') || url.includes('/video/')) {
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'HTML_EXTRACTED',
                    html: document.documentElement.outerHTML,
                    url: url
                }));
            }
            return true;
        }
        return false;
    }

    // Check periodically
    window.toktokInterval = setInterval(() => {
        if (checkLogin()) {
             // Slower checks after success if it hasn't finished yet
        }
    }, 2000);

    checkLogin();
})();
true;
`;

export default function SocialLoginModal({ visible, platform, targetUrl, onClose, onSuccess }: SocialLoginModalProps) {
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [extractedHtml, setExtractedHtml] = useState<string | undefined>();
    const [loginSuccessful, setLoginSuccessful] = useState(false);

    const getUrl = () => {
        return platform === 'instagram' ? INSTAGRAM_LOGIN_URL : TIKTOK_LOGIN_URL;
    };

    const handleMessage = async (event: any) => {
        try {
            const rawData = event.nativeEvent.data;
            if (!rawData || success) return; // Ignore if already successful
            
            const data = JSON.parse(rawData);
            
            if (data.type === 'AUTH_SUCCESS') {
                if (!loginSuccessful) {
                    console.log(`[SocialLoginModal] Login verified for ${platform}`);
                    setLoginSuccessful(true);
                    if (data.cookies) {
                        await SocialAuthService.saveCookies(platform, data.cookies);
                    }
                    
                    // Robust check: compare paths/shortcodes to avoid encoding issues (== vs %3D%3D)
                    const currentPath = data.url.split('?')[0];
                    const targetPath = targetUrl?.split('?')[0];
                    const isAlreadyOnTarget = targetPath && currentPath.includes(targetPath.replace('www.', ''));

                    if (targetUrl && !isAlreadyOnTarget) {
                        console.log(`[SocialLoginModal] Login success. Redirecting to target: ${targetUrl}`);
                        webViewRef.current?.injectJavaScript(`window.location.href = '${targetUrl}'; true;`);
                    }
                }
            }
            
            if (data.type === 'HTML_EXTRACTED') {
                if (success) return; // Prevent double trigger
                
                console.log(`[SocialLoginModal] HTML Extracted (${data.html?.length} chars)`);
                setExtractedHtml(data.html);
                setSuccess(true);
                
                // Clear the interval inside WebView to stop extraction
                webViewRef.current?.injectJavaScript(`if (window.toktokInterval) clearInterval(window.toktokInterval); true;`);
                
                // Delay the final close to let the user see the success state
                setTimeout(() => {
                    onSuccess(data.html);
                }, 1000);
            }
        } catch (error) {
            console.error('[SocialLoginModal] Error handling WebView message:', error);
        }
    };

    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        console.log(`[SocialLoginModal] Navigated to: ${navState.url}`);
        setLoading(navState.loading);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <SafeAreaView style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            LOGIN NO {platform.toUpperCase()}
                        </Text>
                        <Text style={styles.subtitle}>
                            PARA IMPORTAR LINKS PRIVADOS
                        </Text>
                    </View>
                    <View style={{ width: 44 }} /> 
                </SafeAreaView>

                <View style={styles.webviewContainer}>
                    <WebView
                        ref={webViewRef}
                        source={{ uri: getUrl() }}
                        injectedJavaScript={INJECTED_JAVASCRIPT}
                        onMessage={handleMessage}
                        onNavigationStateChange={handleNavigationStateChange}
                        style={styles.webview}
                        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#ff9066" />
                            </View>
                        )}
                    />

                    {success && (
                        <View style={styles.successOverlay}>
                            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
                                <View style={styles.successContent}>
                                    <View style={styles.checkContainer}>
                                        <Ionicons name="checkmark-circle" size={80} color="#34C759" />
                                    </View>
                                    <Text style={styles.successTitle}>CONTA SINCRONIZADA</Text>
                                    <Text style={styles.successSubtitle}>Agora você pode importar vídeos privados</Text>
                                </View>
                            </BlurView>
                        </View>
                    )}
                </View>

                <BlurView intensity={20} tint="dark" style={styles.footer}>
                    <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.footerText}>
                        SUAS SENHAS NÃO SÃO SALVAS. APENAS A SESSÃO É UTILIZADA PARA A IMPORTAÇÃO.
                    </Text>
                </BlurView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0e0e0e',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: '#0e0e0e',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 10,
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 12,
        letterSpacing: 2,
    },
    subtitle: {
        color: '#ff9066',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 9,
        marginTop: 4,
        letterSpacing: 1,
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: 'white', 
    },
    webview: {
        flex: 1,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0e0e0e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(14, 14, 14, 0.8)',
    },
    footerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontFamily: 'PlusJakartaSans-Bold',
        marginLeft: 10,
        textAlign: 'center',
        flex: 1,
    },
    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    successContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    checkContainer: {
        marginBottom: 20,
    },
    successTitle: {
        color: 'white',
        fontSize: 24,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    successSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Medium',
        textAlign: 'center',
        marginTop: 10,
    }
});
