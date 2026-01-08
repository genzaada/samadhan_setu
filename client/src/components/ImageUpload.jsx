import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

const ImageUpload = ({ onImageSelect, label = "Upload Image" }) => {
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimensions to keep size reasonable
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.8 quality
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                setPreview(compressedBase64);
                onImageSelect(compressedBase64);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setPreview(null);
        onImageSelect('');
    };

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {label}
            </label>

            {!preview ? (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label className="btn" style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Upload size={18} />
                        Upload File
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <label className="btn" style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(16, 185, 129, 0.2)', // Green tint
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#34d399',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Camera size={18} />
                        Take Photo
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            ) : (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            height: '150px',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            objectFit: 'cover'
                        }}
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            background: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
