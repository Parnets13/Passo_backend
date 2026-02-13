import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const { active } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === 'true';
    }

    const categories = await Category.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req, res, next) => {
  try {
    const { name, active, icon, description, workerTypes } = req.body;

    // Validate workerTypes
    if (!workerTypes || workerTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one worker type is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      name,
      active,
      icon,
      description,
      workerTypes
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (req, res, next) => {
  try {
    const { name, active, icon, description, workerTypes } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Validate workerTypes if provided
    if (workerTypes && workerTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one worker type is required'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, active, icon, description, workerTypes },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
