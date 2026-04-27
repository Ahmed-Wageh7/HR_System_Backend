export default function softDeletePlugin(schema) {
  const queryMiddleware = [
    'count',
    'countDocuments',
    'find',
    'findOne',
    'findOneAndUpdate',
    'updateMany',
    'updateOne'
  ];

  queryMiddleware.forEach((hook) => {
    schema.pre(hook, function softDeleteFilter(next) {
      if (!this.getOptions().includeDeleted) {
        this.where({ isDeleted: { $ne: true } });
      }
      next();
    });
  });
};
