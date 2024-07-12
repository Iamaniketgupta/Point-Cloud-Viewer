const express = require('express');
const path = require('path');
const cors = require('cors');
const { execFile } = require('child_process');
const util = require('util');
const multer = require('multer');
const fs = require('fs').promises;

const app = express();
const PORT = 5000;

const execFileAsync = util.promisify(execFile);

app.use(cors({
     origin: 'https://test-pointcloud.vercel.app'
}));

app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));

app.use(express.static(path.join(__dirname, 'pointclouds')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

const clearDirectory = async (dirPath) => {
    const files = await fs.readdir(dirPath);
    const unlinkPromises = files.map(filename => fs.rm(path.join(dirPath, filename), { recursive: true, force: true }));
    await Promise.all(unlinkPromises);
};


app.post('/upload', upload.single('pointcloud'), async (req, res) => {
    const sampleFile = req.file;

    if (!sampleFile) {
        return res.status(400).send('No files were uploaded.');
    }

    const outputDir = path.join(__dirname, 'pointclouds', path.parse(sampleFile.originalname).name);
    const potreeConverterPath = path.join(__dirname, 'convertor', 'PotreeConverter.exe');

    const parameters = [
        '-i',
        sampleFile.path,
        '-o', outputDir
    ];

    try {
        await clearDirectory(path.join(__dirname, 'pointclouds'));

        const { stdout, stderr } = await execFileAsync(potreeConverterPath, parameters);
        if (stderr) {
            await fs.unlink(sampleFile.path);
            console.error('PotreeConverter stderr:', stderr);
        }

        const tilesetUrl = `https://test-pointcloud-api.vercel.app/pointclouds/${path.parse(sampleFile.originalname).name}/metadata.json`;
        await fs.unlink(sampleFile.path);

        res.send({
            message: 'File converted successfully!',
            url: tilesetUrl
        });
    } catch (error) {
        console.error('PotreeConverter execution error:', error);
        res.status(500).send(error);
    }
});

app.use('/pointclouds', express.static(path.join(__dirname, 'pointclouds')));

app.get('/pointclouds', (req, res) => {
 res.sendFile(path.join(__dirname, 'pointclouds'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.get('/',(req,res)=>res.send('Hello World'))
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
