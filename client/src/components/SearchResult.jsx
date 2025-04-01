import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`/api/products/search?q=${query}`);
        setProducts(res.data.products);
      } catch (err) {
        console.error(err);
      }
    };

    if (query) {
      fetchProducts();
    }
  }, [query]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl mb-4">Kết quả tìm kiếm cho: "{query}"</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4">
            <h3 className="font-bold">{product.name}</h3>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResult;
