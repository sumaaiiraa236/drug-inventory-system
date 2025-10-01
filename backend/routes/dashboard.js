import express from 'express';
import Drug from '../models/Drug.js';
import Order from '../models/Order.js';
import Vendor from '../models/Vendor.js';
import Hospital from '../models/Hospital.js';

const router = express.Router();

// 📊 Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalDrugs,
      lowStockDrugs,
      totalOrders,
      pendingOrders,
      totalVendors,
      totalHospitals
    ] = await Promise.all([
      Drug.countDocuments(),
      Drug.countDocuments({ status: 'Low Stock' }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['Pending', 'Processing'] } }),
      Vendor.countDocuments({ status: 'Active' }),
      Hospital.countDocuments({ status: 'Active' })
    ]);

    // 💰 Calculate total inventory value
    const drugs = await Drug.find();
    const totalInventoryValue = drugs.reduce((sum, drug) => {
      return sum + (drug.quantity * drug.unitPrice);
    }, 0);

    // 📝 Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendor hospital');

    // 📊 Orders grouped by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 🏆 Top vendors by order count
    const topVendors = await Order.aggregate([
      {
        $group: {
          _id: '$vendor',
          orderCount: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorDetails'
        }
      },
      { $unwind: '$vendorDetails' }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalDrugs,
          lowStockDrugs,
          totalOrders,
          pendingOrders,
          totalVendors,
          totalHospitals,
          totalInventoryValue
        },
        recentOrders,
        ordersByStatus,
        topVendors
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📰 Get activity feed
router.get('/activity', async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('vendor hospital');

    const activities = recentOrders.map(order => ({
      id: order._id,
      type: 'order',
      title: `Order ${order.orderNumber}`,
      description: `${order.vendor.name} - ${order.status}`,
      timestamp: order.createdAt,
      status: order.status
    }));

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
