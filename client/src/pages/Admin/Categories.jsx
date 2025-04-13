import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../services/adminCategoryService';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminSidebar from '../../components/AdminSidebar';

// Simple CategoryList component to display categories without hierarchy
const CategoryList = ({ categories, onEdit, onDelete }) => {
  if (!categories || categories.length === 0) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div key={category._id} className={`p-4 bg-white border rounded-lg shadow-sm ${!category.isActive ? 'opacity-60' : ''}`}>
          <div className="flex items-start mb-4">
            {category.image ? (
              <img 
                src={category.image.startsWith('http') ? category.image : `http://localhost:5000${category.image}`}
                alt={category.name}
                className="h-12 w-12 rounded-full object-cover mr-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/60x60?text=No+Image";
                }}
              />
            ) : (
              <span className="h-12 w-12 mr-3 rounded-full bg-gray-200 flex items-center justify-center">
                <i className="bi bi-tag text-gray-500"></i>
              </span>
            )}
            <div className="flex-1">
              <h3 className="font-medium text-lg">{category.name}</h3>
              {!category.isActive && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Inactive</span>
              )}
            </div>
          </div>
          
          {category.description && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{category.description}</p>
          )}
          
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => onEdit(category._id)}
              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
            >
              <i className="bi bi-pencil-fill mr-1"></i>
              Edit
            </button>
            <button
              onClick={() => onDelete(category._id, category.name)}
              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
            >
              <i className="bi bi-trash-fill mr-1"></i>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCategories();
      
      if (response.success) {
        setCategories(response.categories || []);
      } else {
        setError(response.message || 'Error loading categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditCategory = (categoryId) => {
    navigate(`/admin/categories/${categoryId}`);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        setLoading(true);
        const response = await deleteCategory(categoryId);
        
        if (response.success) {
          // Refresh categories list after successful deletion
          fetchCategories();
          alert('Category deleted successfully!');
        } else {
          setError(response.message || 'Error deleting category');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setError(err.response?.data?.message || 'Unable to connect to server');
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
            <Link 
              to="/admin/categories/add" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
            >
              <i className="bi bi-plus-lg mr-2"></i>
              Add Category
            </Link>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <i className="bi bi-exclamation-triangle-fill mr-2"></i>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4 bg-gray-50 p-3 rounded-md">
              <h2 className="text-lg font-medium text-gray-700 mb-2">Category Management</h2>
              <p className="text-sm text-gray-500">
                Manage your product categories to organize your products effectively.
              </p>
            </div>
            
            <CategoryList 
              categories={categories} 
              onEdit={handleEditCategory} 
              onDelete={handleDeleteCategory}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <i className="bi bi-tags text-4xl text-gray-400 mb-3 block"></i>
            <p className="text-gray-500">No categories found. Add your first category!</p>
            <Link
              to="/admin/categories/add"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              <i className="bi bi-plus-lg mr-2"></i>
              Add Category
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 