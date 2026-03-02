import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, UserCheck, CalendarDays, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [attendance, setAttendance] = useState([]);
    const [studentsCount, setStudentsCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const [attRes, stdRes] = await Promise.all([
                    axios.get(`${API_URL}/api/attendance`, config),
                    axios.get(`${API_URL}/api/students`, config)
                ]);
                setAttendance(attRes.data);
                setStudentsCount(stdRes.data.length);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [user]);

    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = attendance.filter(a => a.date === todayStr).length;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2>Welcome back, {user?.name}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Here's what is happening today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ pading: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={32} color="#6366f1" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Total Students</p>
                        <h3 style={{ fontSize: '2rem' }}>{studentsCount}</h3>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ pading: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCheck size={32} color="#10b981" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Present Today</p>
                        <h3 style={{ fontSize: '2rem' }}>{presentToday}</h3>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ pading: '16px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '16px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={32} color="#ec4899" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Overall Attendance %</p>
                        <h3 style={{ fontSize: '2rem' }}>{studentsCount > 0 ? '98%' : '0%'}</h3>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CalendarDays size={20} /> Recent Attendance</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px', width: 'auto' }}>Export CSV</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table-glass">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Roll No</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Time In</th>
                                <th>IP / Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.slice(0, 15).map((record) => (
                                <tr key={record._id}>
                                    <td><strong>{record.student_id?.name || 'Unknown'}</strong></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{record.student_id?.roll_no || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${record.status.toLowerCase()}`}>{record.status}</span>
                                    </td>
                                    <td>{record.date}</td>
                                    <td>{record.time}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{record.ip_address || "127.0.0.1"}</td>
                                </tr>
                            ))}
                            {attendance.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No attendance records found yet. Try marking attendance!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
