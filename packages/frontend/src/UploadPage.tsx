import { useState } from "react";

export function UploadPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageName, setImageName] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Upload:", { file: selectedFile, name: imageName });
    };

    return (
        <>
            <h2>Upload</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Choose image to upload: </label>
                    <input
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input 
                            name="name" 
                            required 
                            value={imageName}
                            onChange={(e) => setImageName(e.target.value)}
                        />
                    </label>
                </div>

                {previewUrl && (
                    <div>
                        <img 
                            style={{width: "20em", maxWidth: "100%"}} 
                            src={previewUrl} 
                            alt="Preview" 
                        />
                    </div>
                )}

                <input type="submit" value="Confirm upload" />
            </form>
        </>
    );
}
