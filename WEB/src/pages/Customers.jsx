import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import { database } from '../components/Firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const customerTableHead = [
    'STT',
    'Tên',
    'Email',
    'SĐT',
    'Tổng đơn hàng',
    'Tổng giá',
    'Địa chỉ'
];

const renderHead = (item, index) => <th key={index}>{item}</th>;

const renderBody = (item, index) => (
    <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.profile_name || 'Không có tên'}</td>
        <td>{item.auth_email || 'Không có email'}</td>
        <td>{item.phone || 'Không có SĐT'}</td>
        <td>{item.total_orders || 0}</td>
        <td>{item.total_spend ? `${item.total_spend.toLocaleString()} VND` : '0 VND'}</td>
        <td>{item.address || 'Không có địa chỉ'}</td>
    </tr>
);

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const usersRef = ref(database, 'Users');
        
        const unsubscribe = onValue(usersRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    const customerList = Object.entries(data).map(([userId, userData]) => {
                        // Tính toán tổng số đơn hàng và tổng giá trị
                        let totalOrders = 0;
                        let totalSpend = 0;
                        
                        if (userData.orders) {
                            const orders = Object.values(userData.orders);
                            totalOrders = orders.length;
                            totalSpend = orders.reduce((sum, order) => {
                                return sum + (order.total || 0);
                            }, 0);
                        }
                        
                        return {
                            ...userData,
                            id: userId,
                            total_orders: totalOrders,
                            total_spend: totalSpend
                        };
                    });
                    
                    setCustomers(customerList);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error reading customers:", err);
                setError(err.message);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2 className="page-header">
                Customers
            </h2>
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card__body">
                            <Table
                                limit='10'
                                headData={customerTableHead}
                                renderHead={(item, index) => renderHead(item, index)}
                                bodyData={customers}
                                renderBody={(item, index) => renderBody(item, index)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Customers;