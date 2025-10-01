import express from 'express';
import Drug from '../models/Drug.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/drugs/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all drugs
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { drugCode: { $regex: search, $options: 'i' } }
      ];
    }

    const drugs = await Drug.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: drugs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single drug
router.get('/:id', async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }
    res.json({ success: true, data: drug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create drug
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const drugData = {
      ...req.body,
      image: req.file ? `/uploads/drugs/${req.file.filename}` : null
    };

    const drug = new Drug(drugData);
    await drug.save();
    res.status(201).json({ success: true, data: drug });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update drug
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/drugs/${req.file.filename}`;
    }

    const drug = await Drug.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!drug) {
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }

    res.json({ success: true, data: drug });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete drug
router.delete('/:id', async (req, res) => {
  try {
    const drug = await Drug.findByIdAndDelete(req.params.id);
    if (!drug) {
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }
    res.json({ success: true, message: 'Drug deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;