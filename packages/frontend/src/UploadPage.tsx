import React, { useState, useId } from "react";

function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = (err) => reject(err);
    });
}

interface UploadPageProps {
    authToken: string | null;
}

interface FormState {
    success?: boolean;
    error?: string;
}

export function UploadPage({ authToken }: UploadPageProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageName, setImageName] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const fileInputId = useId();

    console.log(selectedFile);
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            try {
                const dataUrl = await readAsDataURL(file);
                setPreviewUrl(dataUrl);
            } catch (error) {
                console.error("Error reading file:", error);
                setPreviewUrl("");
            }
        } else {
            setSelectedFile(null);
            setPreviewUrl("");
        }
    };

    const [state, formAction, isPending] = React.useActionState(
        async (_previousState: FormState, formData: FormData): Promise<FormState> => {
            if (!authToken) {
                return { error: "Authentication required" };
            }

            try {
                const response = await fetch("/api/images", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${authToken}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    return { 
                        error: errorData.message || `Upload failed: ${response.status}` 
                    };
                }

                return { success: true };
            } catch (error) {
                return { 
                    error: error instanceof Error ? error.message : "Failed to upload image" 
                };
            }
        },
        {}
    );

    return (
        <>
            <h2>Upload</h2>
            <form action={formAction}>
                <div>
                    <label htmlFor={fileInputId}>Choose image to upload: </label>
                    <input
                        id={fileInputId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        disabled={isPending}
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input 
                            name="name" 
                            required 
                            disabled={isPending}
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

                <input 
                    type="submit" 
                    value={isPending ? "Uploading..." : "Confirm upload"} 
                    disabled={isPending}
                />

                {(state.success || state.error) && (
                    <div aria-live="polite">
                        {state.success && <p style={{ color: "green" }}>Image uploaded successfully!</p>}
                        {state.error && <p style={{ color: "red" }}>{state.error}</p>}
                    </div>
                )}
            </form>
        </>
    );
}
