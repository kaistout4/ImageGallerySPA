import { useState } from "react";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { fetchDataFromServer } from "./MockAppData.ts";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes";

function App() {
    const [imageData, _setImageData] = useState(fetchDataFromServer);
    
    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={<AllImages imageData={imageData} />} />
                <Route path={ValidRoutes.IMAGE_DETAILS.substring(1)} element={<ImageDetails imageData={imageData} />} />
                <Route path={ValidRoutes.UPLOAD.substring(1)} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN.substring(1)} element={<LoginPage />} />
            </Route>
        </Routes>
    );
}

export default App;
