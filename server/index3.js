// require('dotenv').config();
// const express = require('express');
// const path = require('path');
// const cors = require('cors');
// const { spawn } = require('child_process');
// const multer = require('multer');
// const fs = require('fs');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.static(path.join(__dirname, 'pointclouds')));

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, 'uploads');
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// });

// const upload = multer({ storage: storage });

// app.post('/upload', upload.single('pointcloud'), async (req, res) => {
//     const sampleFile = req.file;

//     if (!sampleFile) {
//         return res.status(400).send('No files were uploaded.');
//     }

//     const outputDir = path.join(__dirname, 'pointclouds', path.parse(sampleFile.originalname).name);
//     const potreeConverterPath = path.join(__dirname, 'convertor', 'PotreeConverter.exe');

//     const parameters = ['-i', sampleFile.path, '-o', outputDir];

//     // Check if PotreeConverter.exe exists
//     if (!fs.existsSync(potreeConverterPath)) {
//         return res.status(500).send('PotreeConverter executable not found.');
//     }

//     const convertProcess = spawn(potreeConverterPath, parameters);

//     convertProcess.stdout.on('data', (data) => {
//         console.log(`stdout: ${data}`);
//     });

//     convertProcess.stderr.on('data', (data) => {
//         console.error(`stderr: ${data}`);
//     });

//     convertProcess.on('close', (code) => {
//         if (code === 0) {
//             const pointcloudUrl = `${req.protocol}://${req.get('host')}/pointclouds/${path.parse(sampleFile.originalname).name}/metadata.json`;

            
//             // Delete the uploaded file after conversion to save space
//             fs.unlink(sampleFile.path, (err) => {
//                 if (err) console.error('Failed to delete uploaded file:', err);
//             });

//             res.send({
//                 message: 'File converted successfully!',
//                 url: pointcloudUrl
//             });
//         } else {
//             console.error(`PotreeConverter process exited with code ${code}`);
//             res.status(500).send(`Conversion failed with code ${code}`);
//         }
//     });
// });

// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 5000;

// Promisify fs.unlink for cleaner asynchronous code
const unlinkAsync = promisify(fs.unlink);

app.use(cors());
app.use(express.static(path.join(__dirname, 'pointclouds')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('pointcloud'), async (req, res) => {
    const sampleFile = req.file;

    if (!sampleFile) {
        return res.status(400).send('No files were uploaded.');
    }

    const outputDir = path.join(__dirname, 'pointclouds', path.parse(sampleFile.originalname).name);
    const potreeConverterPath = path.join(__dirname, 'convertor', 'PotreeConverter.exe');

    const parameters = ['-i', sampleFile.path, '-o', outputDir];

    try {
        const convertProcess = spawn(potreeConverterPath, parameters);

        convertProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        convertProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        convertProcess.on('close', async (code) => {
            if (code === 0) {
                const pointcloudUrl = `${req.protocol}://${req.get('host')}/pointclouds/${path.parse(sampleFile.originalname).name}/metadata.json`;

                try {
                    await unlinkAsync(sampleFile.path);
                } catch (err) {
                    console.error('Failed to delete uploaded file:', err);
                }

                res.send({
                    message: 'File converted successfully!',
                    url: pointcloudUrl
                });
            } else {
                console.error(`PotreeConverter process exited with code ${code}`);
                res.status(500).send(`Conversion failed with code ${code}`);
            }
        });
    } catch (error) {
        console.error('Error in conversion process:', error);
        res.status(500).send('Internal server error.');
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
