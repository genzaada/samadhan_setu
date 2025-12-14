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
        reader.onloadend = () => {
            const base64String = reader.result;
            setPreview(base64String);
            onImageSelect(base64String);
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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={18} />
                        Upload File
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
