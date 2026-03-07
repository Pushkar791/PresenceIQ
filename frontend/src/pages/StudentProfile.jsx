import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, User, BookOpen, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_URL}/api/students/${id}`, config);

                setStudent(res.data.student);
                setAttendance(res.data.attendance);
            } catch (error) {
                console.error("Error fetching student profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, user]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Profile...</div>;
    if (!student) return <div style={{ textAlign: 'center', padding: '50px' }}>Student not found.</div>;

    // Process data for charts
    // Let's count attendance classes (Present) per subject to show performance
    const subjectCounts = attendance.reduce((acc, curr) => {
        if (!acc[curr.subject || 'General']) {
            acc[curr.subject || 'General'] = 0;
        }
        if (curr.status === 'Present') {
            acc[curr.subject || 'General'] += 1;
        }
        return acc;
    }, {});

    const chartData = Object.keys(subjectCounts).map(subject => ({
        name: subject,
        classesAttended: subjectCounts[subject]
    }));

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', fontWeight: '500', fontSize: '1rem' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="glass-panel" style={{ padding: '40px', display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={48} color="var(--text-secondary)" />
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{student.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', margin: 0 }}>Roll No: {student.roll_no}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Activity size={20} color="var(--accent-primary)" /> Total Overview
                        </h3>
                        <div style={{ fontSize: '3rem', fontWeight: '600', color: 'var(--text-primary)' }}>{attendance.length}</div>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Total classes attended</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Clock size={20} color="var(--success)" /> Recent Scans
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {attendance.slice(-5).reverse().map((att, idx) => (
                                <div key={idx} style={{ paddingBottom: '16px', borderBottom: idx !== 4 ? '1px solid var(--glass-border)' : 'none' }}>
                                    <div style={{ fontWeight: '500' }}>{att.date} at {att.time}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{att.subject || 'General'}</div>
                                </div>
                            ))}
                            {attendance.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No attendance logs.</p>}
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                        <BookOpen size={20} color="var(--accent-primary)" /> Subject Performance
                    </h3>

                    {chartData.length > 0 ? (
                        <div style={{ flexGrow: 1, minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: '#e4e4e7' }} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="classesAttended" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            No data available to graph.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
