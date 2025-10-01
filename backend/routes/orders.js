import express from 'express';
import Order from '../models/Order.js';
import Drug from '../models/Drug.js';

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .populate('vendor')
      .populate('hospital')
      .populate('items.drug')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('vendor')
      .populate('hospital')
      .populate('items.drug');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    const orderData = {
      ...req.body,
      orderNumber,
      timeline: [{
        status: 'Pending',
        timestamp: new Date(),
        note: 'Order created'
      }]
    };

    const order = new Order(orderData);
    await order.save();

    // Populate the order before sending response
    await order.populate('vendor hospital items.drug');

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order status changed to ${status}`
    });

    // If delivered, update drug quantities
    if (status === 'Delivered') {
      order.actualDelivery = new Date();
      for (const item of order.items) {
        await Drug.findByIdAndUpdate(item.drug, {
          $inc: { quantity: item.quantity }
        });
      }
    }

    await order.save();
    await order.populate('vendor hospital items.drug');

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;