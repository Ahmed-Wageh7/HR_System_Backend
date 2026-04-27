import softDeletePlugin from '../../middleware/softDelete.js';

export default (schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  });

  schema.plugin(softDeletePlugin);
};
