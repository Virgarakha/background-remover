import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./App.css"; // Menggunakan CSS untuk styling

const App = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [batchImages, setBatchImages] = useState([]);
  const [sliderValue, setSliderValue] = useState(50); // Default posisi slider di tengah

  // Mengatur dropzone untuk mengunggah gambar
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg, image/png, image/webp, image/avif", // Dukungan untuk WEBP dan AVIF
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 1) {
        setBatchImages(acceptedFiles);
      } else {
        setImage(acceptedFiles[0]);
      }
      setProcessedImage(null);
    },
  });

  // Fungsi untuk menghapus background gambar
  const handleRemoveBackground = async (imageFile) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("image_file", imageFile);
    formData.append("size", "auto");

    try {
      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg", // API remove.bg
        formData,
        {
          headers: {
            "X-Api-Key": "yBW1ykzxe3T6k3Pus8o54WCr", // Ganti dengan kunci API yang valid
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
      setHistory([...history, { name: imageFile.name, url }]);
    } catch (error) {
      console.error("Error removing background:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memproses batch gambar
  const handleBatchProcessing = () => {
    if (batchImages.length > 0) {
      batchImages.forEach((img) => handleRemoveBackground(img));
    }
  };

  // Fungsi untuk menangani slider perubahan gambar
  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
  };

  return (
    <div className="App">
      <div className="navbar">
        <img src="img/log.png" alt="" />
      </div>
      <h1 className="title">Background Remover</h1>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        {image ? (
          <p>{image.name}</p>
        ) : (
          <p>Drag 'n' drop an image here, or click to select one</p>
        )}
      </div>
      {image && (
        <button onClick={() => handleRemoveBackground(image)} disabled={loading}>
          {loading ? "Processing..." : "Remove Background"}
        </button>
      )}
      {batchImages.length > 0 && (
        <button onClick={handleBatchProcessing} disabled={loading}>
          {loading ? "Processing Batch..." : "Process Multiple Images"}
        </button>
      )}
      {processedImage && (
        <div className="before-after-container">
          <h2>Compare Before and After</h2>
          <div className="slider-wrapper">
            <div className="slider-image-wrapper">
              {/* Layer 1: Original Image */}
              <img
                src={URL.createObjectURL(image)}
                alt="Original"
                className="original-image"
                style={{ width: "100%", opacity: sliderValue / 100 }}
              />
              {/* Layer 2: Processed Image */}
              <img
                src={processedImage}
                alt="Processed"
                className="processed-image"
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              className="slider"
            />
          </div>
          <a href={processedImage} download="no-backgroundges.png">
            <button>Download</button>
          </a>
        </div>
      )}
      {history.length > 0 && (
        <div className="history">
          <h2>Task History</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index} className="history-item">
                <img src={item.url} alt={item.name} style={{ width: "100px" }} />
                <p>{item.name}</p>
                <a href={item.url} download={`${item.name}-no-background.png`}>
                  <button>Download</button>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
