import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react';

const Register = () => {
    const { user } = useContext(AuthContext);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);

    const [formData, setFormData] = useState({ name: '', roll_no: '' });
    const [isCapturing, setIsCapturing] = useState(false);
    const [frames, setFrames] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
        } catch (err) {
            setMessage({ text: 'Camera access denied or unavailabe', type: 'error' });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
    };

    const captureFrames = () => {
        if (!stream) return;
        setIsCapturing(true);
        setFrames([]);

        let count = 0;
        const interval = setInterval(() => {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

            setFrames(prev => [...prev, dataUrl]);
            count++;

            if (count >= 3) {
                clearInterval(interval);
                setIsCapturing(false);
                stopCamera();
            }
        }, 700); // capture every 700ms, 3 frames
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (frames.length < 3) return setMessage({ text: 'Please capture 3 face frames first', type: 'error' });

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('roll_no', formData.roll_no);

            // Convert dataUrls to Blobs
            for (let i = 0; i < frames.length; i++) {
                const res = await fetch(frames[i]);
                const blob = await res.blob();
                data.append('photos', blob, `frame_${i}.jpg`);
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${API_URL}/api/students`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            });

            setMessage({ text: 'Student registered successfully, face encodings saved.', type: 'success' });
            setFormData({ name: '', roll_no: '' });
            setFrames([]);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Registration failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2>Enroll New Student</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Capture multiple dynamic angles for robust model accuracy.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
                <div className="glass-panel" style={{ padding: '40px', height: 'fit-content' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                            <input
                                type="text" placeholder="John Doe" required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Roll Number / ID</label>
                            <input
                                type="text" placeholder="STU-2026-001" required
                                value={formData.roll_no} onChange={e => setFormData({ ...formData, roll_no: e.target.value })}
                            />
                        </div>

                        {message.text && (
                            <div style={{
                                padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                                background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: message.type === 'error' ? '#ef4444' : '#10b981'
                            }}>
                                {message.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                                {message.text}
                            </div>
                        )}

                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Status: {frames.length}/3 Frames Captured</p>
                            <button type="submit" className="btn-primary" disabled={loading || frames.length < 3}>
                                {loading ? <div className="loader" style={{ margin: '0 auto' }}></div> : 'Completing Enrollment'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: '24px', overflow: 'hidden',
                        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)'
                    }}>
                        {!stream && frames.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <Camera size={48} opacity={0.5} style={{ marginBottom: '16px' }} />
                                <p>Camera is offline.</p>
                            </div>
                        )}

                        <video
                            ref={videoRef} autoPlay playsInline muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: stream ? 'block' : 'none', transform: 'scaleX(-1)' }}
                        />

                        {frames.length > 0 && !stream && (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', padding: '16px', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                                {frames.map((frame, idx) => (
                                    <img key={idx} src={frame} alt="Captured" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', border: '2px solid var(--accent-primary)', transform: 'scaleX(-1)' }} />
                                ))}
                            </div>
                        )}

                        {isCapturing && (
                            <div style={{ position: 'absolute', bottom: '20px', background: 'rgba(0,0,0,0.7)', padding: '12px 24px', borderRadius: '40px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                                Scanning Face Details...
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '20px', width: '100%' }}>
                        {!stream && frames.length === 0 && (
                            <button className="btn-primary" onClick={startCamera}>Open Camera</button>
                        )}

                        {stream && (
                            <button className="btn-primary" onClick={captureFrames} disabled={isCapturing} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                {isCapturing ? 'Capturing Sequence...' : 'Start Scan (3 Frames)'}
                            </button>
                        )}

                        {frames.length > 0 && (
                            <button className="btn-primary" onClick={() => { setFrames([]); startCamera(); }} style={{ background: 'linear-gradient(135deg, #3f3f46, #27272a)' }}>
                                Retake Scan
                            </button>
                        )}
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
            </div>

        </div>
    );
};

export default Register;
