import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { ProtectedRoute } from "../../backend/src/ProtectedRoute.tsx";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes";
import type { IApiImageData } from "../../backend/src/common/ApiImageData";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchString, setSearchString] = useState("");
    const [authToken, setAuthToken] = useState<string | null>(null);
    const requestNumberRef = useRef(0);
    
    const fetchImages = (searchQuery?: string) => {
        if (!authToken) return;
        
        setIsLoading(true);
        setHasError(false);
        
        requestNumberRef.current++;
        const thisRequestNumber = requestNumberRef.current;
        
        const url = searchQuery 
            ? `/api/images/search?q=${encodeURIComponent(searchQuery)}`
            : "/api/images";
            
        fetch(url, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (thisRequestNumber === requestNumberRef.current) {
                    setImageData(data);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                if (thisRequestNumber === requestNumberRef.current) {
                    console.error("Error fetching images:", error);
                    setHasError(true);
                    setIsLoading(false);
                }
            });
    };
    
    useEffect(() => {
        if (authToken) {
            fetchImages();
        }
    }, [authToken]);
    
    const handleUpdateImageName = async (imageId: string, newName: string): Promise<void> => {
        if (!authToken) return;
        
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: newName })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            setImageData(prevData => 
                prevData.map(image => 
                    image.id === imageId 
                        ? { ...image, name: newName }
                        : image
                )
            );
        } catch (error) {
            console.error("Error updating image name:", error);
        }
    };
    
    const handleImageSearch = () => {
        fetchImages(searchString);
    };
    
    const handleAuthSuccess = (token: string) => {
        setAuthToken(token);
    };
    
    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={
                    <ProtectedRoute authToken={authToken}>
                        <AllImages 
                            imageData={imageData} 
                            isLoading={isLoading} 
                            hasError={hasError} 
                            searchPanel={
                                <ImageSearchForm 
                                    searchString={searchString} 
                                    onSearchStringChange={setSearchString} 
                                    onSearchRequested={handleImageSearch} 
                                />
                            } 
                        />
                    </ProtectedRoute>
                } />
                <Route path={ValidRoutes.IMAGE_DETAILS.substring(1)} element={
                    <ProtectedRoute authToken={authToken}>
                        <ImageDetails imageData={imageData} isLoading={isLoading} hasError={hasError} onUpdateImageName={handleUpdateImageName} />
                    </ProtectedRoute>
                } />
                <Route path={ValidRoutes.UPLOAD.substring(1)} element={
                    <ProtectedRoute authToken={authToken}>
                        <UploadPage />
                    </ProtectedRoute>
                } />
                <Route path={ValidRoutes.LOGIN.substring(1)} element={<LoginPage onAuthSuccess={handleAuthSuccess} />} />
                <Route path={ValidRoutes.REGISTER.substring(1)} element={<LoginPage isRegistering={true} onAuthSuccess={handleAuthSuccess} />} />
            </Route>
        </Routes>
    );
}

export default App;
