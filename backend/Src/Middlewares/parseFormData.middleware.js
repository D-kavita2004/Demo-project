export const parseMultipartJSON = (req, res, next) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({
      success: false,
      message: "Data is required",
    });
  }

  try {
    req.body.data = JSON.parse(data);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
    });
  }
};
