const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  // Sales Today
  const salesToday = await Sale.aggregate([
    { $match: { date: { $gte: today } } },
    { $group: { _id: null, totalSales: { $sum: '$total' } } }
  ]);

  // Inventory Stats
  const products = await Product.find({});
  const totalStockValue = products.reduce((acc, p) => acc + (p.stockQty * p.costPrice), 0);
  const lowStockItems = products.filter(p => p.stockQty <= p.lowStockThreshold).length;

  // 7-Day Sales Trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const salesTrend = await Sale.aggregate([
    { $match: { date: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        total: { $sum: "$total" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Top Selling Products (Lifetime)
  const topProducts = await Sale.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        qty: { $sum: "$items.quantity" }
      }
    },
    { $sort: { qty: -1 } },
    { $limit: 5 },
    {
      $project: {
        name: "$_id",
        qty: 1,
        _id: 0
      }
    }
  ]);

  res.json({
    salesToday: salesToday.length > 0 ? salesToday[0].totalSales : 0,
    totalStockValue,
    lowStockItems,
    salesTrend,
    topProducts
  });
});

module.exports = { getDashboardStats };