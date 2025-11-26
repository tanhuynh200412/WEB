import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import { database } from '../components/Firebase/firebaseConfig';
import { ref, onValue, set } from 'firebase/database';

const categoryTableHead = [
    'STT',
    'ID',
    'Tên danh mục',
    'Hình ảnh'
];

const renderHead = (item, index) => <th key={index}>{item}</th>;

const renderBody = (item, index) => (
    <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.id}</td>
        <td>{item.title}</td>
        <td>
            <img 
                src={item.picUrl} 
                alt="category" 
                style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
            />
        </td>
    </tr>
);

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategory, setNewCategory] = useState({
        id: '',
        title: '',
        picUrl: ''
    });

    useEffect(() => {
        const categoriesRef = ref(database, 'Category');
        
        const unsubscribe = onValue(categoriesRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    // Chuyển đổi object thành mảng
                    const categoryList = Object.entries(data)
                        .map(([key, value]) => ({
                            id: key,
                            ...value
                        }))
                        .sort((a, b) => parseInt(a.id) - parseInt(b.id));
                    
                    setCategories(categoryList);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error reading categories:", err);
                setError(err.message);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleAddCategory = () => {
        // Tìm ID tiếp theo (số lớn nhất hiện có + 1)
        const maxId = categories.reduce((max, category) => {
            const categoryId = parseInt(category.id);
            return categoryId > max ? categoryId : max;
        }, 0);
        
        setNewCategory({
            id: (maxId + 1),
            title: '',
            picUrl: ''
        });
        setShowAddForm(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory({
            ...newCategory,
            [name]: value
        });
    };

    const submitCategory = (e) => {
        e.preventDefault();
        
        if (!newCategory.title || !newCategory.picUrl) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên danh mục và URL hình ảnh)');
            return;
        }

        // Sử dụng set để lưu danh mục với ID chỉ định
        set(ref(database, `Category/${newCategory.id}`), newCategory)
            .then(() => {
                alert('Thêm danh mục thành công!');
                setNewCategory({
                    id: '',
                    title: '',
                    picUrl: ''
                });
                setShowAddForm(false);
            })
            .catch(error => {
                console.error("Error adding category: ", error);
                alert('Có lỗi xảy ra khi thêm danh mục');
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className="page-header">
                <h2>Danh mục sản phẩm</h2>
                <button 
                    className="btn btn-add" 
                    onClick={handleAddCategory}
                >
                    + Thêm danh mục
                </button>
            </div>

            {showAddForm && (
                <div className="add-form">
                    <h3>Thêm danh mục mới</h3>
                    <form onSubmit={submitCategory}>
                        <div className="form-group">
                            <label>ID danh mục:</label>
                            <input
                                type="text"
                                name="id"
                                value={newCategory.id}
                                onChange={handleInputChange}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Tên danh mục: <span className="required">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={newCategory.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>URL hình ảnh: <span className="required">*</span></label>
                            <input
                                type="text"
                                name="picUrl"
                                value={newCategory.picUrl}
                                onChange={handleInputChange}
                                required
                                placeholder="https://example.com/image.jpg"
                            />
                            {newCategory.picUrl && (
                                <div className="image-preview">
                                    <img 
                                        src={newCategory.picUrl} 
                                        alt="Preview" 
                                        style={{ width: '100px', height: '100px', marginTop: '10px' }} 
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit">Lưu</button>
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)} 
                                className="btn-cancel"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card__body">
                            <Table
                                limit='10'
                                headData={categoryTableHead}
                                renderHead={renderHead}
                                bodyData={categories}
                                renderBody={renderBody}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .btn-add {
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                
                .btn-add:hover {
                    background-color: #45a049;
                }
                
                .add-form {
                    background: #f9f9f9;
                    padding: 20px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                
                .required {
                    color: red;
                }
                
                .form-group input[type="text"] {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .image-preview {
                    margin-top: 10px;
                }
                
                .image-preview img {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .btn-submit {
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .btn-cancel {
                    background: #f44336;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Categories;