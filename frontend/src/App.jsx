import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentView, setCurrentView] = useState('products');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "Search for 'Product 1a2b'...",
    "Search for 'Product 2430'...",
    "Try searching 'Product f3d1'...",
    "Find your perfect item..."
  ];

  // Rotating placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = { limit: 50 };
      if (activeCategory) params.category = activeCategory;
      if (debouncedSearch) params.search = debouncedSearch;
      if (sort !== 'newest') params.sort = sort;
      if (isLoadMore && nextCursor) params.cursor = nextCursor;

      const response = await axios.get(`${API_BASE_URL}/products`, { params });
      const newProducts = response.data.data.products;
      const newCursor = response.data.data.nextCursor;

      if (isLoadMore) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      setNextCursor(newCursor);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, debouncedSearch, sort, nextCursor]);

  // Refetch when category, search, or sort changes
  useEffect(() => {
    fetchProducts(false);
  }, [activeCategory, debouncedSearch, sort]);

  const handleCategoryClick = (category) => {
    setCurrentView('products');
    if (activeCategory === category) {
      setActiveCategory(''); // deselect
    } else {
      setActiveCategory(category);
    }
  };

  return (
    <div className="app-container fade-in">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Categories</h2>
        <div className="category-list">
          <button 
            className={`category-btn ${activeCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            All Products
          </button>
          {categories.map((cat, idx) => (
            <button 
              key={idx} 
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'products' ? (
          <>
            <header className="header">
              <div className="header-top">
                <h1>{activeCategory ? activeCategory : 'All Products'}</h1>
                <button className="how-it-works-btn" onClick={() => setCurrentView('how-it-works')}>
                  How it works?
                </button>
              </div>
              <div className="search-container">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder={placeholders[placeholderIndex]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select 
                  className="sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Sort by Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </header>

            {loading ? (
              <div className="loading-container">
                <div className="loader"></div>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <div key={product._id} className="product-card fade-in">
                      <span className="product-category">{product.category}</span>
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-footer">
                        <span className="product-price">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="product-id">#{product.unique_id.substring(0, 8)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {products.length === 0 && !loading && (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '3rem' }}>
                    No products found. Try adjusting your search or category filter.
                  </p>
                )}

                {nextCursor && (
                  <button 
                    className="load-more-btn" 
                    onClick={() => fetchProducts(true)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Products'}
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <div className="how-it-works-page fade-in">
            <header className="header" style={{ marginBottom: '2rem' }}>
              <div className="header-top">
                <h1>Architecture & Documentation</h1>
                <button className="how-it-works-btn" onClick={() => setCurrentView('products')}>
                  ← Back to Products
                </button>
              </div>
            </header>
            
            <div className="docs-content">
              <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <a 
                  href="https://github.com/pranav/CodeVector" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '500' }}
                >
                  <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                  </svg>
                  Click here for source code
                </a>
              </div>

              <section className="docs-section">
                <h2>Search Implementation</h2>
                <p>
                  We switched to using a case-insensitive Regular Expression (<code>$regex</code>) search in MongoDB to support 
                  <strong> partial matching</strong> (e.g., searching "prod" matches "Product 123"). While a native <code>$text</code> index 
                  is faster for exact word matching, it tokenizes words and does not support partial word lookups. For a catalog of 200,000 items, 
                  an in-memory regex scan still performs extremely well!
                </p>
              </section>

              <section className="docs-section">
                <h2>Complex Cursor-Based Pagination</h2>
                <p>
                  Offset pagination degrades in performance as the dataset grows and can skip/duplicate items when new data is inserted.
                  We solve this by using the intrinsic timestamp inside MongoDB's <code>_id</code> for "Newest" sort. For Price sorting, we generate a compound cursor (e.g., <code>500_648f5...</code>) and use a <code>$or</code> query to fetch prices greater than the cursor price, or exactly equal to the cursor price but with an older <code>_id</code> to break ties.
                </p>
                
                <h3 style={{marginTop: '1rem', marginBottom: '0.5rem'}}>Combined Indexes</h3>
                <ul className="docs-list">
                  <li><code>{'{ _id: -1 }'}</code> - Base cursor pagination.</li>
                  <li><code>{'{ category: 1, _id: -1 }'}</code> - Category filtering.</li>
                  <li><code>{'{ price: 1, _id: -1 }'}</code> - Ascending price sorting.</li>
                  <li><code>{'{ price: -1, _id: -1 }'}</code> - Descending price sorting.</li>
                  <li><code>{'{ name: 1 }'}</code> - Index for Name (regex scan).</li>
                </ul>
              </section>

              <section className="docs-section">
                <h2>Backend Architecture</h2>
                <p><strong>Logical Segregation into Layers:</strong></p>
                <ul className="docs-list">
                  <li><strong>Routes:</strong> Act as the entry point mapping URLs to Controllers. Organized hierarchically (e.g., <code>/api/v1/products</code>).</li>
                  <li><strong>Middlewares/Validation:</strong> Before reaching the controller, requests pass through Zod schema validation to ensure inputs (like <code>cursor</code>, <code>limit</code>, <code>sort</code>) are correct.</li>
                  <li><strong>Controllers:</strong> Parse the request parameters and send the HTTP response. They contain zero business logic.</li>
                  <li><strong>Services:</strong> The core logic layer. Services determine the <code>nextCursor</code> based on the sorting type and coordinate between different repositories.</li>
                  <li><strong>Repositories:</strong> The only layer that interacts with the database. It constructs the complex MongoDB queries (<code>$text</code>, <code>$lt</code>, <code>$or</code>) and relies heavily on lean execution (<code>.lean()</code>) for speed.</li>
                  <li><strong>Models:</strong> Mongoose schemas that dictate data structure and define all the indexes crucial for performance.</li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
