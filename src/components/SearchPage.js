import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './SearchPage.css'; // Assuming you have some basic styling

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inputError, setInputError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    const clearError = () => {
        setError(null);
        setInputError(null);
    };

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
        if (inputError && event.target.value.trim()) {
            setInputError(null);
        }
    };

    const handleSearch = async () => {
        clearError();

        const trimmedSearchTerm = searchTerm.trim();
        if (!trimmedSearchTerm) {
            setInputError('Please enter a search term.');
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setSearchResults([]);

        try {
            const API_KEY = '49705669-67885751f6e4e83a58cad355a'; // Replace with your API key
            const API_URL = 'https://pixabay.com/api/';
            const apiUrlWithQuery = `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(trimmedSearchTerm)}`;

            const response = await fetch(apiUrlWithQuery);

            if (!response.ok) {
                let message = `API request failed (Status: ${response.status}). Please try again later.`;
                if (response.status === 400) message = "Invalid search request. Please check your search term.";
                if (response.status === 429) message = "Too many requests. Please wait a moment and try again.";
                 if (response.status >= 500) message = "Server error at the image provider. Please try again later.";
                throw new Error(message);
            }

            const data = await response.json();

            if (!data || !Array.isArray(data.hits)) {
                console.error("Unexpected API response structure:", data);
                throw new Error("Received invalid data from the image provider.");
            }

            const images = data.hits.map((item) => ({
                id: item.id,
                url: typeof item.webformatURL === 'string' ? item.webformatURL : '',
                alt: item.tags || 'No tags available',
            })).filter(img => img.url);

            setSearchResults(images);
            if (images.length === 0) {
                setError(`No results found for "${trimmedSearchTerm}".`);
            }

        } catch (err) {
            console.error("Search failed:", err);
            setError(err.message || "Failed to fetch images. Check your internet connection.");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (imageUrl) => {
        navigate(`/edit?imageUrl=${encodeURIComponent(imageUrl)}`); // Navigate to editor with URL
    };


    return (
        <>
            <div>Name: Nidhi Singh Bhadoria</div>
            <div>Email: teamguffonidhi28@gmail.com</div>
            <div className="search-page">
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search for images..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        aria-invalid={!!inputError}
                        style={inputError ? { borderColor: 'red' } : {}}
                    />
                    <button onClick={handleSearch} disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    {inputError && <span className="input-error-message" style={{ color: 'red', marginLeft: '10px' }}>{inputError}</span>}
                </div>

                {error && <div className="error-message" style={{ color: 'red', marginTop: '10px', padding: '5px', border: '1px solid red' }}>Error: {error}</div>}


                <div className="search-results">
                    {loading && <div className="loading-indicator">Loading images...</div>}
                    {!loading && searchResults.length > 0 && (
                        searchResults.map((image) => (
                            <div key={image.id} className="image-result-item">
                                {image.url ? <img src={image.url} alt={image.alt} /> : <span>Invalid image data</span>}
                                <button onClick={() => handleImageSelect(image.url)}>
                                    Add Caption
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default SearchPage;