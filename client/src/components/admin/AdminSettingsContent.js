import React, { useState, useEffect } from "react";
import API from "../../api.js";
import toast from "react-hot-toast";
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Save,
  X,
  Gift,
} from "lucide-react";

const AdminSettingsContent = () => {
  // Current active section controls which UI section to show (banners or surprises or future)
  const [activeSection, setActiveSection] = useState("banners");

  // === Banners state ===
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Banner upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    linkUrl: "",
    order: 0,
    image: null,
  });

  // === Surprises state ===
  const [surprises, setSurprises] = useState([]);
  const [loadingSurprises, setLoadingSurprises] = useState(true);
  const [newSurprise, setNewSurprise] = useState("");

  // Sections available in settings, can expand with future sections if needed
  const sections = [
    { id: "banners", name: "Change Banners", icon: ImageIcon },
    { id: "surprises", name: "Surprises", icon: Gift },
    // Future sections example:
    // { id: 'general', name: 'General Settings', icon: Settings },
    // { id: 'email', name: 'Email Settings', icon: Mail },
  ];

  // Fetch banners when relevant section active
  useEffect(() => {
    if (activeSection === "banners") {
      fetchBanners();
    }
  }, [activeSection]);

  // Fetch surprises when relevant section active
  useEffect(() => {
    if (activeSection === "surprises") {
      fetchSurprises();
    }
  }, [activeSection]);

  // Fetch all banners for admin
  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const response = await API.get("/api/banners/admin", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setLoadingBanners(false);
    }
  };

  // Handle banner upload form inputs
  const handleUploadFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setUploadForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setUploadForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Upload new banner
  const handleUploadBanner = async (e) => {
    e.preventDefault();

    if (!uploadForm.image) {
      toast.error("Please select an image");
      return;
    }
    if (!uploadForm.title.trim()) {
      toast.error("Please enter a banner title");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", uploadForm.image);
      formData.append("title", uploadForm.title);
      formData.append("linkUrl", uploadForm.linkUrl);
      formData.append("order", uploadForm.order);

      await API.post("/api/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Banner uploaded successfully!");
      setShowUploadModal(false);
      setUploadForm({ title: "", linkUrl: "", order: 0, image: null });
      await fetchBanners();
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error(error.response?.data?.message || "Failed to upload banner");
    } finally {
      setUploading(false);
    }
  };

  // Toggle banner active/inactive status
  const toggleBannerStatus = async (bannerId, currentStatus) => {
    try {
      await API.put(
        `/api/banners/${bannerId}`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(
        `Banner ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      await fetchBanners();
    } catch (error) {
      console.error("Error updating banner status:", error);
      toast.error("Failed to update banner status");
    }
  };

  // Delete banner with confirmation
  const deleteBanner = async (bannerId, bannerTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${bannerTitle}"? This action cannot be undone.`
      )
    )
      return;

    try {
      await API.delete(`/api/banners/${bannerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Banner deleted successfully");
      await fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  // Fetch all surprises for admin
  const fetchSurprises = async () => {
    setLoadingSurprises(true);
    try {
      const res = await API.get("/api/surprises/admin", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSurprises(res.data);
    } catch (error) {
      console.error("Error fetching surprises:", error);
      toast.error("Failed to load surprises");
    } finally {
      setLoadingSurprises(false);
    }
  };

  // Add new surprise reward
  const addSurprise = async () => {
    if (!newSurprise.trim()) return;

    try {
      await API.post(
        "/api/surprises",
        { description: newSurprise.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Surprise added successfully!");
      setNewSurprise("");
      await fetchSurprises();
    } catch (error) {
      console.error("Error adding surprise:", error);
      toast.error(error.response?.data?.message || "Failed to add surprise");
    }
  };

  // Toggle surprise active state
  const toggleSurprise = async (id, currentActive) => {
    try {
      await API.put(
        `/api/surprises/${id}`,
        { active: !currentActive },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(
        `Surprise ${!currentActive ? "activated" : "deactivated"} successfully`
      );
      await fetchSurprises();
    } catch (error) {
      console.error("Error updating surprise:", error);
      toast.error("Failed to update surprise");
    }
  };

  // Delete surprise with confirmation
  const deleteSurprise = async (id, description) => {
    if (
      !window.confirm(
        `Are you sure you want to delete surprise "${description}"?`
      )
    )
      return;

    try {
      await API.delete(`/api/surprises/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Surprise deleted successfully");
      await fetchSurprises();
    } catch (error) {
      console.error("Error deleting surprise:", error);
      toast.error("Failed to delete surprise");
    }
  };

  // Render the banner management section
  const renderBannersSection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Banner Management
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage banner images displayed on the homepage slideshow
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      {loadingBanners ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse"
            >
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No banners found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Upload your first banner to get started
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
            >
              <div className="relative">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-banner.jpg";
                  }}
                />
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                    banner.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {banner.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {banner.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Order: {banner.order} | Created:{" "}
                  {new Date(banner.createdAt).toLocaleDateString()}
                </p>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() =>
                      toggleBannerStatus(banner._id, banner.isActive)
                    }
                    className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                      banner.isActive
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {banner.isActive ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span>{banner.isActive ? "Hide" : "Show"}</span>
                  </button>

                  <button
                    onClick={() => deleteBanner(banner._id, banner.title)}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Upload New Banner
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadBanner} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Banner Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleUploadFormChange}
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended size: 1200x400px. Max file size: 10MB
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Banner Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link URL (Optional)
                </label>
                <input
                  type="url"
                  name="linkUrl"
                  value={uploadForm.linkUrl}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={uploadForm.order}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first in the slideshow
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Banner</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  // Render Surprises management section
  const renderSurprisesSection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Surprises Management
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage loyalty surprises rewarded to customers
          </p>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="New surprise description"
            value={newSurprise}
            onChange={(e) => setNewSurprise(e.target.value)}
            className="border rounded px-3 py-2 text-gray-900 dark:text-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
          <button
            onClick={addSurprise}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4 inline-block mr-1" />
            Add
          </button>
        </div>
      </div>

      {/* Surprises List */}
      {loadingSurprises ? (
        <p className="text-gray-900 dark:text-gray-100">Loading surprises...</p>
      ) : surprises.length === 0 ? (
        <p className="text-gray-900 dark:text-gray-100">No surprises found.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {surprises.map((surprise) => (
            <li
              key={surprise._id}
              className="flex justify-between py-3 text-gray-900 dark:text-gray-100"
            >
              <span
                className={
                  surprise.active
                    ? ""
                    : "line-through text-gray-400 dark:text-gray-600"
                }
              >
                {surprise.description}
              </span>
              <div className="space-x-3">
                <button
                  onClick={() => toggleSurprise(surprise._id, surprise.active)}
                  className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                >
                  {surprise.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() =>
                    deleteSurprise(surprise._id, surprise.description)
                  }
                  className="text-sm px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section tab navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex border-b border-gray-200 dark:border-gray-700">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{section.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          {activeSection === "banners" && renderBannersSection()}
          {activeSection === "surprises" && renderSurprisesSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsContent;
