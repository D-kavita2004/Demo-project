export const parseMultipartJSON = (req, res, next) => {
  if (req.body?.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format",
      });
    }
  }
  next();
};
