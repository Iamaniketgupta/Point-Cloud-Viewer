import { useState, useRef } from 'react';
import './App.css';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import PointcloudNavigator from './components/PointcloudNavigator';
// import PointcloudNavigator from './components/sample';
import axios from 'axios';
import { FaChevronCircleLeft } from "react-icons/fa";
import MapView from './components/MapView';
// const requrl = `https://test-pointcloud-api.vercel.app`
const requrl = `http://localhost:5000`
function App() {
  const [convertedURL, seturl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function uploadPointCloud(files) {
    const formData = new FormData();
    formData.append('pointcloud', files[0]);

    setLoading(true);
    
    setUploading(true);
    try {
      const res = await axios.post(`${requrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });
      console.log(res);
      seturl(res.data.url);
      
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    seturl('')
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    seturl('')

    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadPointCloud(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {

    if (e.target.files && e.target.files[0]) {
      seturl('')
      uploadPointCloud(e.target.files);
    }
  };

  console.log(convertedURL);

  return (
    // <>
    // <MapView></MapView>
    // </>
    <div className='bg-[#111111] overflow-clip h-screen w-screen'>
      <div className='flex w-full h-full'>
        {/* side bar */}
        <div className='w-[290px] relative flex flex-col border-r border-blue-500 shadow-xl'>
          <FaChevronCircleLeft size={25} className='cursor-pointer font-extrabold bg-white rounded-full text-blue-500 absolute top-[50%] -right-4 z-50'>
          </FaChevronCircleLeft>
          {/* LOGO */}
          <div className='bg-[#1a1a1a] text-white text-center p-2 py-5 text-2xl font-semibold'>
            <h2>Point Cloud Viewer</h2>
          </div>

          {/* Upload */}
          <div className='my-4 p-3 '>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed p-4 text-center ${dragActive ? 'border-blue-500' : 'border-gray-500'}`}
            >
              <input
                type="file"
                id="fileUpload"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                name="pointcloud"
              />
              <label htmlFor="fileUpload" className="cursor-pointer text-gray-400">
                Drag & Drop your file here or click to select
              </label>
            </div>
            <p className='text-center mt-2 text-gray-200'>OR</p>
            <label htmlFor="fileUpload" className="cursor-pointer bg-blue-500 py-1 hover:bg-blue-400 text-white text-center my-2 mx-auto block">
              Upload LAS/LAZ
            </label>

            {uploading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" className="text-white">{`${Math.round(uploadProgress)}%`}</Typography>
                </Box>
              </Box>
            )}
          </div>

          {/* Files list  */}
          {/* <div className='opacity-80 text-white  flex flex-col gap-4 my-2 p-3 px-4 overflow-y-scroll' style={{ scrollbarWidth: 'none' }}>
            <h3 className='text-center'>MY Files</h3>
            <div className='bg-[#2e2c2c] p-2 pz-3 hover:bg-opacity-50 cursor-pointer border border-blue-500 rounded-lg shadow text-white text-xs'>
              <p className='text-sm font-semibold my-1'>Agri Land</p>
              <p className='text-blue-500'>LAZ</p>
            </div>
          
          </div> */}

        </div>

        {/* Viewer */}
        <div className='h-full bg-[#111111] relative flex flex-grow'>
          {loading ? (
            <Box className='flex justify-center items-center w-full h-full'>
              <CircularProgress />
            </Box>
          ) : (
            <PointcloudNavigator url={convertedURL} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
