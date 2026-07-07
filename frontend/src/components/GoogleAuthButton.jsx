import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const loadGoogleScript = () => new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    if (existingScript) {
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }

        existingScript.addEventListener('load', resolve, { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
});

const GoogleAuthButton = ({ onCredential, onError, text = 'continue_with', enableOneTap = false }) => {
    const buttonRef = useRef(null);
    const [status, setStatus] = useState('idle');
    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

    useEffect(() => {
        if (!clientId || !buttonRef.current) return undefined;

        let isMounted = true;

        loadGoogleScript()
            .then(() => {
                if (!isMounted || !window.google?.accounts?.id) return;

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: ({ credential }) => onCredential?.(credential),
                    auto_select: false,
                    cancel_on_tap_outside: false,
                });

                buttonRef.current.innerHTML = '';
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    text,
                    shape: 'pill',
                    width: buttonRef.current.offsetWidth || 320,
                });

                if (enableOneTap) {
                    window.google.accounts.id.prompt();
                }

                setStatus('ready');
            })
            .catch(() => {
                if (!isMounted) return;
                setStatus('error');
                onError?.('Google sign-in could not be loaded right now.');
            });

        return () => {
            isMounted = false;
            if (enableOneTap && window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
        };
    }, [clientId, enableOneTap, onCredential, onError, text]);

    if (!clientId) {
        return null;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
                ref={buttonRef}
                style={{ minHeight: '44px', display: 'flex', justifyContent: 'center', width: '100%' }}
            />
            {status === 'error' && (
                <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                    Google sign-in is currently unavailable.
                </div>
            )}
        </div>
    );
};

export default GoogleAuthButton;
