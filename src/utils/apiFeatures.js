class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.pagination = null;
  }

  filter(searchFields = []) {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    const filters = { ...this.queryString };
    excludedFields.forEach((field) => delete filters[field]);

    const mongoFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (value === 'true') mongoFilters[key] = true;
        else if (value === 'false') mongoFilters[key] = false;
        else mongoFilters[key] = value;
      }
    });

    if (this.queryString.search && searchFields.length) {
      mongoFilters.$or = searchFields.map((field) => ({
        [field]: { $regex: this.queryString.search, $options: 'i' }
      }));
    }

    this.query = this.query.find(mongoFilters);
    return this;
  }

  sort(defaultSort = '-createdAt') {
    if (this.queryString.sort) {
      const [field, direction] = this.queryString.sort.split('_');
      this.query = this.query.sort(`${direction === 'desc' ? '-' : ''}${field}`);
    } else {
      this.query = this.query.sort(defaultSort);
    }
    return this;
  }

  paginate(totalDocuments) {
    const page = Math.max(1, Number(this.queryString.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(this.queryString.limit) || 20));
    const skip = (page - 1) * limit;
    const totalPages = Math.max(1, Math.ceil(totalDocuments / limit));

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = {
      page,
      limit,
      totalDocuments,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
    return this;
  }
}

export default APIFeatures;
