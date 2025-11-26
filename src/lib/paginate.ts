export const paginate = (items: any[], page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  const totalPages = Math.ceil(items.length / limit);

  return {
    page,
    limit,
    totalPages,
    totalItems: items.length,
    items: paginatedItems,
  };
};
