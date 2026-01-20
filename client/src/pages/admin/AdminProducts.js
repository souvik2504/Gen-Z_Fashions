import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import ImageUpload from '../../components/admin/ImageUpload';
import Loader from '../../components/Loader';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Package,
  DollarSign,
  Star
} from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // 🔥 NEW: Updated form state for variant-based products
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'unisex',
    variants: [], // 🔥 NEW: Array of {size, color, stock}
    images: [],
    featured: false
  });

  // 🔥 NEW: Current variant being added
  const [currentVariant, setCurrentVariant] = useState({
    size: 'S',
    color: '',
    stock: 0
  });

  // 🔥 NEW: Available options
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = [
    'Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 
    'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown'
  ];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/products?page=${currentPage}&search=${searchTerm}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Add variant to product
  const addVariant = () => {
    if (!currentVariant.color.trim()) {
      toast.error('Please select a color');
      return;
    }

    if (currentVariant.stock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    // Check if variant already exists
    const existingVariant = formData.variants.find(
      v => v.size === currentVariant.size && v.color.toLowerCase() === currentVariant.color.toLowerCase()
    );

    if (existingVariant) {
      toast.error(`Variant ${currentVariant.color} - ${currentVariant.size} already exists`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { 
        ...currentVariant, 
        stock: parseInt(currentVariant.stock) || 0,
        color: currentVariant.color.trim()
      }]
    }));

    // Reset current variant
    setCurrentVariant({
      size: 'S',
      color: '',
      stock: 0
    });

    toast.success('Variant added successfully');
  };

  // 🔥 NEW: Remove variant from product
  const removeVariant = (size, color) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => !(v.size === size && v.color === color))
    }));
    toast.success('Variant removed');
  };

  // 🔥 NEW: Update existing variant
  const updateVariant = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = field === 'stock' ? (parseInt(value) || 0) : value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const analyzeWithAI = async (imageFile) => {
    try {
      const aiFormData = new FormData();
      aiFormData.append('image', imageFile);

      toast.loading('AI analyzing product image...');

      const response = await axios.post('/api/ai/analyze-product-image', aiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const ai = response.data;
      const defaultSizes = ['S','M','L','XL'];

      setFormData(prev => ({
        ...prev,
        name: ai.name || prev.name,
        description: ai.description || prev.description,
        category: ai.category || prev.category,
        variants: ai.colors
        ? defaultSizes.flatMap(size =>
            ai.colors.map(color => ({
              size,
              color,
              stock: 0
            }))
          )
        : prev.variants
      }));

      toast.dismiss();
      toast.success('AI filled product details');

    } catch (err) {
      toast.dismiss();
      toast.error('AI analysis failed');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 NEW: Validate variants
    if (formData.variants.length === 0) {
      toast.error('Please add at least one variant (size + color + stock)');
      return;
    }

    setSubmitting(true);
    
    try {
      const formDataObj = new FormData();
      
      // Add basic fields
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('category', formData.category);
      formDataObj.append('featured', formData.featured);
      
      // 🔥 NEW: Add variants instead of sizes and colors
      formDataObj.append('variants', JSON.stringify(formData.variants));

      // Add image files
      formData.images.forEach((image, index) => {
        if (image.file) {
          formDataObj.append('images', image.file);
        }
      });

      // Keep existing images for edit mode
      if (editingProduct) {
        const existingImages = formData.images
          .filter(img => !img.file)
          .map(img => img.url || img);
        formDataObj.append('existingImages', JSON.stringify(existingImages));
      }

      let response;
      if (editingProduct) {
        response = await axios.put(`/api/admin/products/${editingProduct._id}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        response = await axios.post('/api/admin/products', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    // 🔥 UPDATED: Handle both old format (sizes/colors) and new format (variants)
    let variants = [];
    
    if (product.variants && product.variants.length > 0) {
      // New format - product already has variants
      variants = product.variants;
    } else if (product.sizes && product.colors) {
      // Old format - convert sizes and colors to variants
      variants = [];
      for (const sizeObj of product.sizes) {
        for (const color of product.colors) {
          variants.push({
            size: sizeObj.size,
            color: color,
            stock: Math.floor(sizeObj.stock / product.colors.length) // Distribute stock evenly
          });
        }
      }
    }

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      variants: variants,
      images: product.images.map(url => ({ url, preview: url })),
      featured: product.featured
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  // 🔥 UPDATED: Reset form with variants
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'unisex',
      variants: [],
      images: [],
      featured: false
    });
    setCurrentVariant({
      size: 'S',
      color: '',
      stock: 0
    });
  };

  // 🔥 NEW: Group variants by color for better display
  const variantsByColor = formData.variants.reduce((acc, variant) => {
    if (!acc[variant.color]) {
      acc[variant.color] = [];
    }
    acc[variant.color].push(variant);
    return acc;
  }, {});

  // 🔥 NEW: Calculate total stock for display
  const getTotalStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((total, variant) => total + variant.stock, 0);
    } else if (product.sizes) {
      // Fallback for old format
      return product.sizes.reduce((total, size) => total + size.stock, 0);
    }
    return 0;
  };

  // 🔥 NEW: Get available colors for display
  const getAvailableColors = (product) => {
    if (product.variants && product.variants.length > 0) {
      return [...new Set(product.variants.map(v => v.color))];
    } else if (product.colors) {
      // Fallback for old format
      return product.colors;
    }
    return [];
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center">
            <Loader />
            <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg">Loading products...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your t-shirt inventory with size + color variants</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={product.images?.[0] || '/placeholder-tshirt.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-tshirt.jpg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getAvailableColors(product).join(', ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.variants ? product.variants.length : (product.sizes ? product.sizes.length * (product.colors?.length || 1) : 0)} variants
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTotalStock(product)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.featured ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 UPDATED: Add/Edit Product Modal with Variants */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Images Upload */}
              {/* <ImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData({ ...formData, images })}
                maxImages={5}
              /> */}
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => {
                  setFormData({ ...formData, images });
                  if (images[0]?.file) analyzeWithAI(images[0].file);
                }}
                maxImages={5}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Kids</option>
                </select>
              </div>

              {/* 🔥 NEW: Variants Management */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Product Variants (Size + Color + Stock)</h3>
                
                {/* Add Variant Form */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium mb-3">Add New Variant</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <select
                        value={currentVariant.size}
                        onChange={(e) => setCurrentVariant(prev => ({...prev, size: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {availableSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <select
                        value={currentVariant.color}
                        onChange={(e) => setCurrentVariant(prev => ({...prev, color: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Color</option>
                        {availableColors.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                        <option value="custom">Custom Color</option>
                      </select>
                    </div>

                    {/* Custom color input */}
                    {currentVariant.color === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Color</label>
                        <input
                          type="text"
                          placeholder="Enter color name"
                          onChange={(e) => setCurrentVariant(prev => ({...prev, color: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={currentVariant.stock}
                        onChange={(e) => setCurrentVariant(prev => ({...prev, stock: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addVariant}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Variants Display */}
                {formData.variants.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-4">Current Variants ({formData.variants.length})</h4>
                    
                    {/* Grouped by Color */}
                    <div className="space-y-4">
                      {Object.entries(variantsByColor).map(([color, variants]) => (
                        <div key={color} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900 capitalize">
                              {color} ({variants.length} sizes)
                            </h5>
                            <span className="text-sm text-gray-500">
                              Total Stock: {variants.reduce((sum, v) => sum + v.stock, 0)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {variants.map((variant, vIndex) => {
                              const globalIndex = formData.variants.findIndex(
                                v => v.size === variant.size && v.color === variant.color
                              );
                              return (
                                <div key={`${variant.size}-${variant.color}`} 
                                     className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm">{variant.size}:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={variant.stock}
                                      onChange={(e) => updateVariant(globalIndex, 'stock', e.target.value)}
                                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                                    />
                                    <span className="text-xs text-gray-500">pcs</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(variant.size, variant.color)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                    title="Remove variant"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Total Variants: <strong>{formData.variants.length}</strong></span>
                        <span>Total Stock: <strong>{formData.variants.reduce((sum, v) => sum + v.stock, 0)}</strong></span>
                        <span>Colors: <strong>{Object.keys(variantsByColor).length}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {formData.variants.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No variants added yet. Add your first size + color + stock combination above.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Featured Product
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.variants.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>
                    {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
