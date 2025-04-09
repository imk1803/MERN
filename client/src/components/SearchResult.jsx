import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`/api/search/search?q=${encodeURIComponent(query)}&page=${currentPage}`);
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Có lỗi xảy ra khi tìm kiếm sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!query) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-xl mb-4">Vui lòng nhập từ khóa tìm kiếm</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Kết quả tìm kiếm cho: "{query}"</h2>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
              <Link to={`/products/${product._id}`}>
                <div className="mb-2">
                  {product.image ? (
                    <img 
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name} 
                      className="w-full h-48 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-red-600 font-bold mt-2">{product.price ? product.price.toLocaleString() : 0} VNĐ</p>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description || 'Không có mô tả'}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              &laquo; Prev
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Next &raquo;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
