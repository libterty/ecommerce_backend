const adminController = {
  hiAdmin: (req, res) => {
    res.status(200).json({ status: 'success', message: 'Hello Admin!' });
  }
};

module.exports = adminController;
