// controllers/resourceController.js

// GET
exports.getResources = async (req, res) => {
  try {
    
    const Resource = global._ResourceModel;
    if (!Resource) {
      return res.status(503).json({ error: 'Resource model not available.' });
    }

    const rows = await Resource.findAll({
      where: { is_active: true },
      order: [['category', 'ASC'], ['title', 'ASC']],
    });

    
    const grouped = {};
    for (const r of rows) {
      const cat = r.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        id:          r.id,
        title:       r.title,
        url:         r.url,
        description: r.description,
        icon:        r.icon,
      });
    }

    res.json({ grouped, flat: rows });
  } catch (error) {
    console.error('getResources error:', error);
    res.status(500).json({ error: error.message });
  }
};
