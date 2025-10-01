import express from 'express';
import Hospital from '../models/Hospital.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/hospitals/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { hospitalCode: { $regex: search, $options: 'i' } }
      ];
    }

    const hospitals = await Hospital.find(query).populate('consumptionData.drug');
    res.json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single hospital
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('consumptionData.drug');
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create hospital
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const hospitalData = {
      ...req.body,
      image: req.file ? `/uploads/hospitals/${req.file.filename}` : null
    };

    const hospital = new Hospital(hospitalData);
    await hospital.save();
    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update hospital
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/hospitals/${req.file.filename}`;
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete hospital
router.delete('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;